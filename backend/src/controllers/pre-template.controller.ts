import { PrismaClient } from "@prisma/client";
import PreTemplateRepository from "../repository/pre-template.repo";
import { GET } from "../decorators/router";
import { Request, Response } from "express";
import { AuthMiddleware } from "../middlewares";
import { UserService } from "../services/user.service";
import { UserNotFoundError } from "../modules/error";
import { HTTPStatus } from "../constants";

export default class PreTemplateController {
  private prisma: PrismaClient;
  private preTemplateRepo: PreTemplateRepository;
  private userService: UserService;

  constructor() {
    this.prisma = new PrismaClient();
    this.preTemplateRepo = new PreTemplateRepository();
    this.userService = new UserService();
  }

  @GET("/api/v1/pre/template")
  public async getPreTemplate(req: Request, res: Response) {
    await AuthMiddleware.verifyToken(req, res, () => {});
    const { templateId } = req.body;
    try {
      const preTemplateData = await this.preTemplateRepo.getPreTemplatById(
        templateId
      );

      return res.status(HTTPStatus.OK).json({
        status: true,
        message: "Pre-Template retrieved successfully!",
        data: preTemplateData,
      });
    } catch (error) {
      console.error("Error retrieving Pre-Template:", error);
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to retrieve Pre-Template",
      });
    }
  }

  @GET("/api/v1/pre/template/all")
  public async getAllPreTemplates(req: Request, res: Response) {
    // await AuthMiddleware.verifyToken(req, res, () => {});

    try {
      const preTemplates = await this.preTemplateRepo.getAllPreTemplates();

      return res.status(HTTPStatus.OK).json({
        status: true,
        message: "Pre-Templates retrieved successfully!",
        data: preTemplates,
      });
    } catch (error) {
      console.error("Error retrieving Pre-Template:", error);
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to retrieve Pre-Template",
      });
    }
  }
}
