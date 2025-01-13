import { Request, Response } from "express";
import { GET } from "../../decorators/router";
import TriggerRepository from "../../repository/trigger.repo";
import { HTTPStatus } from "../../constants";
import { APIResponse } from "../../interface/api";

export default class TriggerController {
  @GET("/api/v1/trigger/available")
  public async getAllAvailableTriggers(
    req: Request,
    res: Response<APIResponse>
  ) {
    try {
      const triggerRepo = new TriggerRepository();
      const triggerData = await triggerRepo.getAllAvailableTriggers();
      return res.status(200).json({
        status: true,
        message: "All available triggers retrieved",
        data: triggerData,
      });
    } catch (err: any) {
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to retrieve triggers",
      });
    }
  }
}
