import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import User from "../models/user_model";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis";
import hash_token from "../lib/hash_token";
import { jwtPayload } from "../middleware/auth_middleware";

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

export const signup = async (req: Request, res: Response) => {
  const error = validationResult(req);
  try {
    if (!error.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: error.array()[0].msg,
        error: error.array(),
      });
    }
    const { email, password } = req.body;
    const user_exists = await User.findOne({ email });
    if (user_exists) {
      return res.status(409).json({
        success: false,
        message: "user already exists",
      });
    }

    const hashed_password = await bcrypt.hash(password, 10);
    const new_user: any = new User({
      ...req.body,
      password: hashed_password,
    });
    const access_token = jwt.sign(
      { user_id: new_user._id, email: new_user.email },
      process.env.ACCESS_SECRET!,
      { expiresIn: "15m" },
    );
    const refresh_token = jwt.sign(
      { user_id: new_user._id, email: new_user.email },
      process.env.REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await redis.set(
      `refresh_token:${new_user._id}`,
      hash_token(refresh_token),
      "EX",
      REFRESH_TTL_SECONDS,
    );

    await new_user.save();

    return res.status(201).json({
      success: true,
      message: "account succesfully created",
      data: new_user,
    });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: `${error.msg}`, error: error });
  }
};

export const login = async (req: Request, res: Response) => {
  const error = validationResult(req);

  try {
    if (!error.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: `${error.array()[0].msg}`,
        error: error.array(),
      });
    }

    const { email, password } = req.body;
    const user: any = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "invalid credentials",
      });
    }
    const password_match = await bcrypt.compare(password, user.password);

    if (!password_match) {
      return res.status(404).json({
        success: false,
        message: "invalid credentials",
      });
    }

    const access_token = jwt.sign(
      { user_id: user._id, email: user.email },
      process.env.ACCESS_SECRET!,
      { expiresIn: "15m" },
    );
    const refresh_token = jwt.sign(
      { user_id: user._id, email: user.email },
      process.env.REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await redis.set(
      `refresh_token:${user._id}`,
      hash_token(refresh_token),
      "EX",
      REFRESH_TTL_SECONDS,
    );
    return res.status(200).json({
      success: true,
      message: "login successful",
      data: user,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.msg,
    });
  }
};

export const log_out = async (req: Request, res: Response) => {
  try {
    const refresh_token = req.cookies.refresh_token;

    if (refresh_token) {
      await redis.del(`refresh_token:${(req.user! as jwtPayload).user_id}`);
    }

    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({ success: true, message: "loggin out" });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: `${error.msg}`, error: error.msg });
  }
};

export const refresh_token = async (req: Request, res: Response) => {
  const refresh_token = req.cookies.refresh_token;
  try {
    if (!refresh_token) {
      return res.status(401).json({
        success: false,
        message: "no token found please login",
      });
    }
    let decoded: any;
    try {
      decoded = jwt.verify(refresh_token, process.env.REFRESH_SECRET!);
    } catch (error: any) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: "token expired please login",
        });
      } else {
        return res
          .status(401)
          .json({ success: false, message: "invalid token" });
      }
    }

    const saved_token = await redis.get(`refresh_token:${decoded.user_id}`);
    if (!saved_token || saved_token !== hash_token(refresh_token)) {
      return res.status(401).json({
        success: false,
        message: "refresh token invalid  please login",
      });
    }
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    const new_access_token = jwt.sign(
      { user_id: user._id, email: user.email },
      process.env.ACCESS_SECRET!,
      { expiresIn: "15m" },
    );

    const new_refresh_token = jwt.sign(
      { user_id: user._id, email: user.email },
      process.env.REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    res.cookie("access_token", new_access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", new_refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    await redis.set(
      `refresh_token:${user._id}`,
      hash_token(new_refresh_token),
      "EX",
      REFRESH_TTL_SECONDS,
    );
    return res.status(200).json({ success: true, message: "token refreshed" });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, message: "server error" });
  }
};
