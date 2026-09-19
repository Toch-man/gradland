import { jwtPayload } from "./middleware/auth_middleware";

declare global {
  namespace Express {
    interface Request {
      user?: jwtPayload;
    }
  }
}
