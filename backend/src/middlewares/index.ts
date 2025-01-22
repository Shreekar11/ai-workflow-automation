import jwt from "jsonwebtoken";
import { HTTPStatus } from "../constants";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { Request, Response, NextFunction } from "express";

export class AuthMiddleware {
  constructor() {}
  public static async verifyToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(HTTPStatus.UNAUTHORIZED).json({
          status: false,
          message: "Unauthorized",
          error: "Unauthorized",
        });
      }

      const token = authHeader.split(" ")[1];

      const decodedToken = jwt.decode(token) as { sub: string };

      if (!decodedToken || !decodedToken.sub) {
        return res.status(HTTPStatus.UNAUTHORIZED).json({
          status: false,
          message: "Unauthorized",
          error: "Unauthorized",
        });
      }

      const clerkUserId = decodedToken.sub;

      const user = await clerkClient.users.getUser(clerkUserId);

      if (!user) {
        return res.status(HTTPStatus.UNAUTHORIZED).json({
          status: false,
          message: "Unauthorized: Missing user ID",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Error in token verification:", error);
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Internal server error during token verification",
      });
    }
  }
}
