import express from "express";
import cookieParser from "cookie-parser";
import auth_router from "./routers/auth_route";
import path_router from "./routers/path_route";
import user_router from "./routers/user_route";
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", auth_router);
app.use("/api/path", path_router);
app.use("api/user", user_router);

export default app;
