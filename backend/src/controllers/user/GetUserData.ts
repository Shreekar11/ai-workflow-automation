import { Request, Response } from "express";
import { GET, POST } from "../../decorators/router";
import UserRepository from "../../repository/user.repo";

export default class GetUserDataController {
  @GET("/v1/user")
  public async getUserData(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({ message: "User data" });
  }

  @POST("/v1/user")
  public async createUserData(req: Request, res: Response): Promise<Response> {
    const { clerkUserId, firstName, lastName, email, password } = req.body;
    const createUserData = await new UserRepository().create({
      clerkUserId,
      firstName,
      lastName,
      email,
      password,
    });
    return res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: createUserData,
    });
  }
}
