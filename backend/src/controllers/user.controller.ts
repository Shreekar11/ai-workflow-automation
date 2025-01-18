import { Request, Response } from "express";
import { CreateUserSchema } from "../types";
import { GET, POST } from "../decorators/router";
import UserRepository from "../repository/user.repo";
import { APIResponse } from "../interface/api";
import { HTTPStatus } from "../constants";
import { UserService } from "../services/user.service";

export default class UserController {
  private userService: UserService;
  constructor() {
    this.userService = new UserService();
  }

  @POST("/api/v1/user")
  public async createUserData(
    req: Request,
    res: Response<APIResponse>
  ): Promise<Response<APIResponse>> {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(HTTPStatus.BAD_REQUEST).json({
          status: false,
          message: "Request body is empty",
        });
      }

      const parsedData = CreateUserSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(HTTPStatus.BAD_REQUEST).json({
          status: false,
          message: "Invalid input data",
          error: parsedData.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }

      const createUserData = await this.userService.createUser(parsedData);

      return res.status(HTTPStatus.CREATED).json({
        status: true,
        message: "User created successfully",
        data: createUserData,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to create user",
      });
    }
  }

  @GET("/api/v1/user/:clerkUserId")
  public async getUserData(
    req: Request,
    res: Response<APIResponse>
  ): Promise<Response<APIResponse>> {
    try {
      const { clerkUserId } = req.params;

      if (!clerkUserId) {
        return res.status(HTTPStatus.BAD_REQUEST).json({
          status: false,
          message: "clerkUserId is required",
        });
      }

      if (typeof clerkUserId !== "string" || clerkUserId.trim().length === 0) {
        return res.status(HTTPStatus.BAD_REQUEST).json({
          status: false,
          message: "Invalid clerkUserId format",
        });
      }

      const userData = await this.userService.fetchUserByClerkId(
        clerkUserId.trim()
      );

      if (!userData) {
        return res.status(HTTPStatus.NOT_FOUND).json({
          status: false,
          message: "User not found",
        });
      }

      return res.status(HTTPStatus.OK).json({
        status: true,
        message: "User data retrieved successfully",
        data: userData,
      });
    } catch (error) {
      console.error("Error retrieving user:", error);
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to retrieve user data",
      });
    }
  }
}
