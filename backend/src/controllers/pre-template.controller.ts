import { HTTPStatus } from "../constants";
import { GET } from "../decorators/router";
import { Request, Response } from "express";
import { AuthMiddleware } from "../middlewares";
import PreTemplateRepository from "../repository/pre-template.repo";

export default class PreTemplateController {
  private preTemplateRepo: PreTemplateRepository;

  constructor() {
    this.preTemplateRepo = new PreTemplateRepository();
  }

  @GET("/api/v1/pre/template/:id")
  public async getPreTemplate(req: Request, res: Response) {
    // await AuthMiddleware.verifyToken(req, res, () => {});
    const { id } = req.params;
    try {
      const preTemplateData = await this.preTemplateRepo.getPreTemplateById(id);

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

  @GET("/api/v1/pre/template")
  public async getAllPreTemplates(req: Request, res: Response) {
    await AuthMiddleware.verifyToken(req, res, () => {});

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
