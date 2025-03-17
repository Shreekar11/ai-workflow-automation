import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { POST } from "../decorators/router";
import { APIResponse } from "../interface/api";
import { AuthMiddleware } from "../middlewares";
import { HTTPStatus } from "../constants";
import { TemplateSchema } from "../types";
import { UserService } from "../services/user.service";
import { UserNotFoundError } from "../modules/error";
import TemplateService from "../services/template.service";

export default class TemplateController {
  private userService: UserService;
  private templateService: TemplateService;

  constructor() {
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
        parsedData.data
      );

      return res.status(200).json({
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
}
