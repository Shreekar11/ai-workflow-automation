import { PrismaClient } from "@prisma/client";
import { GET } from "../decorators/router";
import { Request, Response } from "express";
import { AuthMiddleware } from "../middlewares";
import { HTTPStatus } from "../constants";
import { UserNotFoundError } from "../modules/error";
import { APIResponse } from "../interface/api";
import { UserService } from "../services/user.service";

export default class RunController {
  private prisma: PrismaClient;
  private userService: UserService;
  constructor() {
    this.prisma = new PrismaClient();
    this.userService = new UserService();
  }

  @GET("/api/v1/run")
  public async getFlowRuns(
    req: Request,
    res: Response<APIResponse>
  ): Promise<Response<APIResponse>> {
    await AuthMiddleware.verifyToken(req, res, () => {});
    const user = req.user;

    try {
      let userData;
      try {
        userData = await this.userService.fetchUserByClerkId(user.id);
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          return res.status(HTTPStatus.NOT_FOUND).json({
            status: false,
            message: error.message,
          });
        }
        throw error;
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const workflows = await tx.workflow.findMany({
          where: {
            userId: userData.id,
          },
          include: {
            workflowRuns: true,
          },
        });

        const templates = await tx.template.findMany({
          where: {
            userId: userData.id,
          },
          include: {
            templateResults: true,
          },
        });

        return {
          workflows,
          templates,
        };
      });

      return res.status(HTTPStatus.OK).json({
        status: true,
        message: "Runs retrieved successfully!",
        data: result,
      });
    } catch (error: any) {
      console.error("Error fetching runs:", error);
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch runs. Please try again later.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}
