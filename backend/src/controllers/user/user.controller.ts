import { Request, Response } from "express";
import { CreateUserSchema } from "../../types";
import { GET, POST } from "../../decorators/router";
import UserRepository from "../../repository/user.repo";

export default class UserController {
  @POST("/api/v1/user")
  public async createUserData(req: Request, res: Response): Promise<Response> {
    const body = req.body;

    const parsedData = CreateUserSchema.safeParse(body);
    if (!parsedData.success) {
      return res.status(400).json({
        status: false,
        message: "Incorrect data",
      });
    }

    const userExists = await new UserRepository().getUserByEmail(
      parsedData.data.email
    );

    if (userExists) {
      return res.status(403).json({
        status: false,
        message: "User already exists",
      });
    }

    const createUserData = await new UserRepository().create({
      clerkUserId: parsedData.data.clerkUserId,
      firstName: parsedData.data.firstName,
      lastName: parsedData.data.lastName,
      email: parsedData.data.email,
    });

    return res.status(201).json({
      status: true,
      message: "User created successfully",
      data: createUserData,
    });
  }

  @GET("/api/v1/user/:clerkUserId")
  public async getUserData(req: Request, res: Response): Promise<Response> {
    const { clerkUserId } = req.params;
    const userData = await new UserRepository().getUserByClerkUserId(
      clerkUserId?.toString() || ""
    );
    return res.status(200).json({
      status: true,
      message: "User data retrieved successfully",
      data: userData,
    });
  }
}
