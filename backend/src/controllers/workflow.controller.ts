import { Request, Response } from "express";
import { WorkFlowSchema } from "../types";
import { DELETE, GET, POST, PUT } from "../decorators/router";
import WorkFlowRepo from "../repository/workflow.repo";
import { PrismaClient } from "@prisma/client";
import UserRepository from "../repository/user.repo";
import { HTTPStatus } from "../constants";
import { APIResponse } from "../interface/api";
import { WorkflowService } from "../services/workflow.service";
import { UserService } from "../services/user.service";
import { UserNotFoundError } from "../modules/error";

export default class WorkFlowController {
  private prisma: PrismaClient;
  private workflowService: WorkflowService;
  private userService: UserService;

  constructor() {
    this.prisma = new PrismaClient();
    this.workflowService = new WorkflowService();
    this.userService = new UserService();
  }

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

      let userData;
      try {
        userData = await this.userService.fetchUserByClerkId(clerkUserId);
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          return res.status(HTTPStatus.NOT_FOUND).json({
            status: false,
            message: error.message,
          });
        }
        throw error;
      }

      const workflow = await this.workflowService.createWorkflow(
        userData,
        parsedData
      );

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

      let userData;
      try {
        userData = await this.userService.fetchUserByClerkId(clerkUserId);
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          return res.status(HTTPStatus.NOT_FOUND).json({
            status: false,
            message: error.message,
          });
        }
        throw error;
      }

      const userWorkFlowData = await this.workflowService.fetchAllWorkflows(
        userData
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

      let userData;
      try {
        userData = await this.userService.fetchUserByClerkId(clerkUserId);
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          return res.status(HTTPStatus.NOT_FOUND).json({
            status: false,
            message: error.message,
          });
        }
        throw error;
      }

      const workFlowData = await this.workflowService.fetchWorkFlowById(
        id,
        userData.id
      );

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

      const updatedWorkflowData = await this.workflowService.updateWorkflow(
        parsedData
      );

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

      const deleteWorkflow = await this.workflowService.deleteWorkflow(id);

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
