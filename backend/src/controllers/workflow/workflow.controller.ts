import { Request, Response } from "express";
import { WorkFlowSchema } from "../../types";
import { DELETE, GET, POST, PUT } from "../../decorators/router";
import WorkFlowRepo from "../../repository/workflow.repo";
import { PrismaClient } from "@prisma/client";
import UserRepository from "../../repository/user.repo";
import { HTTPStatus } from "../../constants";
import { APIResponse } from "../../interface/api";

export default class WorkFlowController {
  private prisma: PrismaClient = new PrismaClient();

  @POST("/api/v1/workflow")
  public async createWorkFlowData(
    req: Request,
    res: Response<APIResponse>
  ): Promise<Response<APIResponse>> {
    try {
      const { body } = req;
      const clerkUserId = req.headers["clerk-user-id"]?.toString();

      if (!clerkUserId) {
        return res.status(HTTPStatus.UNAUTHORIZED).json({
          status: false,
          message: "Unauthorized: Missing user ID",
        });
      }

      const parsedData = WorkFlowSchema.safeParse(body);
      if (!parsedData.success) {
        return res.status(HTTPStatus.BAD_REQUEST).json({
          status: false,
          message: "Invalid workflow data",
        });
      }

      const userRepo = new UserRepository();
      const userData = await userRepo.getUserByClerkUserId(clerkUserId);
      if (!userData) {
        return res.status(HTTPStatus.NOT_FOUND).json({
          status: false,
          message: "User not found",
        });
      }

      const workflow = await this.prisma.$transaction(async (tx) => {
        const newWorkflow = await tx.workflow.create({
          data: {
            userId: userData.id,
            name: parsedData.data.name,
            triggerId: "",
            actions: {
              create: parsedData.data.actions.map((item, index) => ({
                actionId: item.availableActionId,
                sortingOrder: index,
                metadata: item.actionMetadata,
              })),
            },
          },
          include: {
            actions: true,
          },
        });

        const trigger = await tx.trigger.create({
          data: {
            triggerId: parsedData.data.availableTriggerId,
            workflowId: newWorkflow.id,
            metadata: parsedData.data.triggerMetadata,
          },
        });

        return await tx.workflow.update({
          where: { id: newWorkflow.id },
          data: { triggerId: trigger.id },
          include: {
            actions: true,
            trigger: true,
          },
        });
      });

      return res.status(HTTPStatus.CREATED).json({
        status: true,
        message: "Workflow created successfully",
        data: workflow,
      });
    } catch (err: any) {
      console.error("Error creating workflow:", err);
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to create workflow",
      });
    }
  }

  @GET("/api/v1/workflow")
  public async getWorkFlowData(
    req: Request,
    res: Response<APIResponse>
  ): Promise<Response<APIResponse>> {
    try {
      const clerkUserId = req.headers["clerk-user-id"]?.toString();

      if (!clerkUserId) {
        return res.status(HTTPStatus.UNAUTHORIZED).json({
          status: false,
          message: "Unauthorized: Missing user ID",
        });
      }

      const userRepo = new UserRepository();
      const userData = await userRepo.getUserByClerkUserId(clerkUserId);

      if (!userData) {
        return res.status(HTTPStatus.NOT_FOUND).json({
          status: false,
          message: "User not found",
        });
      }

      const workflowRepo = new WorkFlowRepo();
      const userWorkFlowData = await workflowRepo.getAllUsersWorkFlow(
        userData.id
      );

      return res.status(HTTPStatus.OK).json({
        status: true,
        message: "Workflows retrieved successfully",
        data: userWorkFlowData,
      });
    } catch (err: any) {
      console.error("Error fetching workflows:", err);
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch workflows",
      });
    }
  }

  @GET("/api/v1/workflow/:id")
  public async getWorkFlowDataById(
    req: Request,
    res: Response<APIResponse>
  ): Promise<Response<APIResponse>> {
    try {
      const { id } = req.params;
      const clerkUserId = req.headers["clerk-user-id"]?.toString();

      if (!clerkUserId) {
        return res.status(HTTPStatus.UNAUTHORIZED).json({
          status: false,
          message: "Unauthorized: Missing user ID",
        });
      }

      if (!id) {
        return res.status(HTTPStatus.BAD_REQUEST).json({
          status: false,
          message: "Workflow ID is required",
        });
      }

      const userRepo = new UserRepository();
      const userData = await userRepo.getUserByClerkUserId(clerkUserId);

      if (!userData) {
        return res.status(HTTPStatus.NOT_FOUND).json({
          status: false,
          message: "User not found",
        });
      }

      const workflowRepo = new WorkFlowRepo();
      const workFlowData = await workflowRepo.getWorkFlowById(id, userData.id);

      if (!workFlowData) {
        return res.status(HTTPStatus.NOT_FOUND).json({
          status: false,
          message: "Workflow not found",
        });
      }

      return res.status(HTTPStatus.OK).json({
        status: true,
        message: "Workflow retrieved successfully",
        data: workFlowData,
      });
    } catch (err: any) {
      console.error("Error fetching workflow:", err);
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch workflow",
      });
    }
  }

  @PUT("/api/v1/workflow")
  public async updateWorkflow(req: Request, res: Response<APIResponse>) {
    try {
      const body = req.body;
      const clerkUserId = req.headers["clerk-user-id"];

      if (!clerkUserId) {
        return res.status(HTTPStatus.UNAUTHORIZED).json({
          status: false,
          message: "Unauthorized",
        });
      }

      const parsedData = WorkFlowSchema.safeParse(body);
      if (!parsedData.success) {
        return res.status(HTTPStatus.BAD_REQUEST).json({
          status: false,
          message: "Invalid workflow data",
        });
      }

      const updatedWorkflowData = await this.prisma.$transaction(async (tx) => {
        await tx.workflow.update({
          where: {
            id: parsedData.data.id,
          },
          data: {
            name: parsedData.data.name,
          },
        });

        // delete earlier actions and create new to update them
        await tx.action.deleteMany({
          where: {
            workflowId: parsedData.data.id,
          },
        });

        // new actions created
        if (parsedData.data.actions.length > 0) {
          await tx.action.createMany({
            data: parsedData.data.actions.map((item, index) => ({
              workflowId: parsedData.data.id || "",
              actionId: item.availableActionId,
              metadata: item.actionMetadata || {},
              sortingOrder: index,
            })),
          });
        }

        const updatedData = await tx.workflow.findUnique({
          where: {
            id: parsedData.data.id,
          },
          include: {
            actions: {
              include: {
                type: true,
              },
              orderBy: {
                sortingOrder: "asc",
              },
            },
            trigger: {
              include: {
                type: true,
              },
            },
          },
        });

        return updatedData;
      });

      if (!updatedWorkflowData) {
        return res.status(HTTPStatus.NOT_FOUND).json({
          status: false,
          message: "Workflow not found",
        });
      }

      return res.status(HTTPStatus.OK).json({
        status: true,
        message: "Workflow updated successfully",
        data: updatedWorkflowData,
      });
    } catch (err: any) {
      console.error("Error updating workflow:", err);

      if (err.code === "P2025") {
        return res.status(HTTPStatus.NOT_FOUND).json({
          status: false,
          message: "Workflow not found",
        });
      }

      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Error updating workflow",
      });
    }
  }

  @DELETE("/api/v1/workflow/:id")
  public async deleteWorkflow(req: Request, res: Response<APIResponse>) {
    try {
      const { id } = req.params;
      const clerkUserId = req.headers["clerk-user-id"];

      if (!clerkUserId) {
        return res.status(HTTPStatus.UNAUTHORIZED).json({
          status: false,
          message: "Unauthorized",
        });
      }

      const existingWorkflow = await this.prisma.workflow.findUnique({
        where: { id },
      });

      if (!existingWorkflow) {
        return res.status(HTTPStatus.NOT_FOUND).json({
          status: false,
          message: "Workflow not found or already deleted",
        });
      }

      const deleteWorkflow = await this.prisma.$transaction(async (tx) => {
        const triggerCount = await tx.trigger.count({
          where: { workflowId: id },
        });

        if (triggerCount > 0) {
          await tx.trigger.delete({
            where: { workflowId: id },
          });
        }

        const actionCount = await tx.action.count({
          where: { workflowId: id },
        });

        if (actionCount > 0) {
          await tx.action.deleteMany({
            where: { workflowId: id },
          });
        }

        return await tx.workflow.delete({
          where: { id },
        });
      });

      return res.status(HTTPStatus.OK).json({
        status: true,
        message: "Workflow and associated data deleted successfully",
        data: deleteWorkflow,
      });
    } catch (err: any) {
      console.error("Error deleting workflow:", err);

      if (err.code === "P2025") {
        return res.status(HTTPStatus.NOT_FOUND).json({
          status: false,
          message: "Workflow not found or already deleted",
        });
      }

      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Error deleting workflow",
      });
    }
  }
}
