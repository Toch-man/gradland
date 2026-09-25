import express from "express";
import cookieParser from "cookie-parser";
import auth_router from "./routers/auth_route";
import path_router from "./routers/path_route";
import user_router from "./routers/user_route";
import opportunity_router from "./routers/opportunity_route";
import cors from "cors";
const app = express();

const allowed_origins = [process.env.CLIENT_URL, "http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowed_origins.includes(origin)) return callback(null, true);
      return callback(new Error("Blocked by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", auth_router);
app.use("/api/path", path_router);
app.use("/api/user", user_router);
app.use("/api/opportunity", opportunity_router);
export default app;
