import { Request, Response } from "express";
import { WorkFlowSchema } from "../../types";
import { GET, POST } from "../../decorators/router";
import WorkFlowRepo from "../../repository/workflow.repo";
import { PrismaClient } from "@prisma/client";
import UserRepository from "../../repository/user.repo";

export default class WorkFlowController {
  private prisma: PrismaClient = new PrismaClient();

  @POST("/api/v1/workflow")
  public async create1WorkFlowData(
    req: Request,
    res: Response
  ): Promise<Response> {
    const body = req.body;
    const clerkUserId = req.headers["clerk-user-id"];
    if (!clerkUserId) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    const userData = await new UserRepository().getUserByClerkUserId(
      clerkUserId?.toString() || ""
    );
    if (!userData) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const parsedData = WorkFlowSchema.safeParse(body);
    if (!parsedData.success) {
      return res
        .status(400)
        .json({ status: false, message: "Incorrect Workflow data" });
    }

    const workflow = await this.prisma.$transaction(async (tx) => {
      const workflow = await tx.workflow.create({
        data: {
          userId: userData.id,
          triggerId: "",
          actions: {
            create: parsedData.data.actions.map((item, index) => ({
              actionId: item.availableActionId,
              sortingOrder: index,
            })),
          },
        },
      });

      const trigger = await tx.trigger.create({
        data: {
          triggerId: parsedData.data.availableTriggetId,
          workflowId: workflow.id,
        },
      });

      await tx.workflow.update({
        where: {
          id: workflow.id,
        },
        data: {
          triggerId: trigger.id,
        },
      });

      return workflow;
    });

    return res.status(201).json({
      status: true,
      message: "Workflow created successfully",
      data: workflow,
    });
  }

  @GET("/api/v1/workflow")
  public async getWorkFlowData(req: Request, res: Response): Promise<Response> {
    const clerkUserId = req.headers["clerk-user-id"];
    if (!clerkUserId) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }
    const userData = await new UserRepository().getUserByClerkUserId(
      clerkUserId?.toString() || ""
    );
    if (!userData) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    const userId: number = userData.id;
    const userWorkFlowData = await new WorkFlowRepo().getAllUsersWorkFlow(
      userId
    );
    return res.status(200).json({
      status: true,
      message: "User WorkFlows retrieved",
      data: userWorkFlowData,
    });
  }

  @GET("/api/v1/workflow/:id")
  public async getWorkFlowDataById(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { id } = req.params;
    const clerkUserId = req.headers["clerk-user-id"];
    if (!clerkUserId) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }
    const userData = await new UserRepository().getUserByClerkUserId(
      clerkUserId?.toString() || ""
    );
    const userId: number | undefined = userData?.id;
    const workFlowData = await new WorkFlowRepo().getWorkFlowById(id, userId);
    return res.status(200).json({
      status: true,
      message: "WorkFlow data retrieved successfully",
      data: workFlowData,
    });
  }
}
