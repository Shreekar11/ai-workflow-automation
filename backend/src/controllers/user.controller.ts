import { Request, Response } from "express";
import { CreateUserSchema } from "../types";
import { GET, POST } from "../decorators/router";
import UserRepository from "../repository/user.repo";
import { APIResponse } from "../interface/api";
import { HTTPStatus } from "../constants";

export default class UserController {

  private userRepo: UserRepository;
  constructor() {
    this.userRepo = new UserRepository();
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

      try {
        const userExists = await this.userRepo.getUserByEmail(parsedData.data.email);

        if (userExists) {
          return res.status(HTTPStatus.CONFLICT).json({
            status: false,
            message: "User with this email already exists",
          });
        }
      } catch (error) {
        throw new Error("Error checking existing user");
      }

      const userData = {
        clerkUserId: parsedData.data.clerkUserId,
        firstName: parsedData.data.firstName,
        lastName: parsedData.data.lastName,
        email: parsedData.data.email.toLowerCase().trim(),
      };

      const createUserData = await this.userRepo.create(userData);

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
      const userRepo = new UserRepository();
      const userData = await userRepo.getUserByClerkUserId(clerkUserId.trim());

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
