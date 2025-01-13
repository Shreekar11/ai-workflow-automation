import { Request, Response } from "express";
import { GET } from "../../decorators/router";
import ActionRepository from "../../repository/action.repo";
import { HTTPStatus } from "../../constants";
import { APIResponse } from "../../interface/api";

export default class ActionController {
  @GET("/api/v1/action/available")
  public async getAllAvailableActions(req: Request, res: Response<APIResponse>) {
    try {
        const actionRepo = new ActionRepository();
      const actionData = await actionRepo.getAllAvailableActions();
      return res.status(200).json({
        status: true,
        message: "All available actions retrieved",
        data: actionData,
      });
    } catch (err: any) {
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to retrieve triggers",
      });
    }
  }
}
