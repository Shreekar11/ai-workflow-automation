import { Request, Response } from "express";
import { GET, POST } from "../decorators/router";
import { APIResponse } from "../interface/api";
import { AuthMiddleware } from "../middlewares";
import { HTTPStatus } from "../constants";
import { TemplateSchema } from "../types";
import { UserService } from "../services/user.service";
import { UserNotFoundError } from "../modules/error";
import TemplateService from "../services/template.service";
import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";

const QUEUE_NAME = "workflow-events";

export default class TemplateController {
  private prisma: PrismaClient;
  private userService: UserService;
  private templateService: TemplateService;

  constructor() {
    this.prisma = new PrismaClient();
    this.userService = new UserService();
    this.templateService = new TemplateService();
  }

  @POST("/api/v1/template")
  public async createTemplate(
    req: Request,
    res: Response<APIResponse>
  ): Promise<Response<APIResponse>> {
    await AuthMiddleware.verifyToken(req, res, () => {});
    try {
      const user = req.user;
      const { body } = req;

      const parsedData = TemplateSchema.safeParse(body);
      if (!parsedData.success) {
        return res.status(HTTPStatus.BAD_REQUEST).json({
          status: false,
          message: "Invalid template data",
        });
      }

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

      const template = await this.templateService.createTemplate(
        userData,
        parsedData
      );

      return res.status(HTTPStatus.CREATED).json({
        status: true,
        message: "Template saved successfully!",
        data: template,
      });
    } catch (err) {
      console.error("Error creating template:", err);
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to create template",
      });
    }
  }

  @GET("/api/v1/template")
  public async getAllUserTemplates(req: Request, res: Response) {
    await AuthMiddleware.verifyToken(req, res, () => {});
    const user = req.user;
    try {
      const userData = await this.userService.fetchUserByClerkId(user.id);
      const templates = await this.templateService.fetchAllTemplates(userData);
      return res.status(HTTPStatus.OK).json({
        status: true,
        message: "Templates retrieved successfully!",
        data: templates,
      });
    } catch (err) {
      console.log("Error: ", err);
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch templates",
      });
    }
  }

  @GET("/api/v1/template/:id")
  public async getUserTemplateById(req: Request, res: Response) {
    await AuthMiddleware.verifyToken(req, res, () => {});
    const { id } = req.params;
    try {
      const template = await this.templateService.fetchTemplateById(id);
      return res.status(HTTPStatus.OK).json({
        status: true,
        message: "Template retrieved successfully!",
        data: template,
      });
    } catch (err) {
      console.log("Error: ", err);
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch template",
      });
    }
  }

  @POST("/api/v1/template/:id/run")
  public async templateRunFunction(req: Request, res: Response) {
    await AuthMiddleware.verifyToken(req, res, () => {});
    const { body } = req;
    const { id } = req.params;

    if (!id) {
      return res.status(HTTPStatus.BAD_REQUEST).json({
        status: false,
        message: "Template ID is required",
      });
    }

    const redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    redisClient.on("error", (err: any) =>
      console.error("Redis Client Error:", err)
    );

    try {
      await redisClient.connect();

      const templateResult = await this.prisma.templateResult.create({
        data: {
          templateId: id,
          metadata: body.metadata,
          status: "running",
        },
      });

      const message = JSON.stringify({
        templateResultId: templateResult.id,
        stage: 0,
      });

      const pipeline = redisClient.multi();
      pipeline.lPush(QUEUE_NAME, message);
      await pipeline.exec();

      console.log("Message pushed to Redis queue successfully");

      return res.status(HTTPStatus.OK).json({
        status: true,
        message: "Template processed successfully",
        workflowId: id,
      });
    } catch (err) {
      console.error("Error processing template:", err);
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to process template",
      });
    } finally {
      await redisClient.disconnect();
    }
  }
}
