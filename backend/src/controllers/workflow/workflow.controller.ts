import { Request, Response } from "express";
import { GET } from "../../decorators/router";

export default class WorkFlowController {
  @GET("/api/v1/workflow")
  public async getWorkFlowData(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({ message: "WorkFlow data" });
  }
}
