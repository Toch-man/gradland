import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface jwtPayload {
  user_id: string;
  email: string;
}
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(403).json({
        success: false,
        message: "token unavailable",
      });
    }
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET!) as jwtPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    console.error(error);
    return res.status(401).json({
      success: false,
      message: "invalid or expired token",
      error: error.message,
    });
  }
};
