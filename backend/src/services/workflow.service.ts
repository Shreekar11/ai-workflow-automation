import { PrismaClient, Prisma } from "@prisma/client";
import WorkFlowRepo from "../repository/workflow.repo";
import { WorkflowInterface } from "../interface/workflow";
import { UserInterface } from "../interface/user";
import {
  AppError,
  WorkflowCreateError,
  WorkflowError,
  WorkflowNotFoundError,
} from "../modules/error";
import { generateRandomString } from "../utils";

export class WorkflowService {
  private prisma: PrismaClient;
  private workflowRepo: WorkFlowRepo;

  constructor() {
    this.prisma = new PrismaClient();
    this.workflowRepo = new WorkFlowRepo();
  }

  public async createWorkflow(
    userData: UserInterface,
    parsedData: {
      data: WorkflowInterface;
    }
  ) {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          try {
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

            const availableTrigger = await tx.availableTrigger.findUnique({
              where: {
                id: parsedData.data.availableTriggerId,
              },
            });

            if(availableTrigger?.name === "Webhook") {
              await tx.webhookKey.create({
                data: {
                  triggerId: trigger.id,
                  secretKey: generateRandomString(),
                }
              });
            }

            return await tx.workflow.update({
              where: { id: newWorkflow.id },
              data: { triggerId: trigger.id },
              include: {
                actions: true,
                trigger: true,
              },
            });
          } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              switch (error.code) {
                case "P2002":
                  throw new WorkflowCreateError(
                    "A workflow with this name already exists"
                  );
                case "P2003":
                  throw new WorkflowCreateError(
                    "Invalid reference to action or trigger"
                  );
                default:
                  throw new WorkflowCreateError(
                    "Failed to create workflow due to database constraint"
                  );
              }
            }

            throw error;
          }
        },
        {
          maxWait: 5000,
          timeout: 10000,
        }
      );
    } catch (error) {
      if (error instanceof WorkflowError) {
        throw error;
      }
      console.error("Unexpected error in createWorkflow:", error);
      throw new WorkflowCreateError(
        "An unexpected error occurred while creating the workflow"
      );
    }
  }

  public async fetchAllWorkflows(userData: UserInterface) {
    try {
      const workflows = await this.workflowRepo.getAllUsersWorkFlow(
        userData.id
      );

      if (!workflows || workflows.length === 0) {
        throw new WorkflowNotFoundError();
      }

      return workflows;
    } catch (error) {
      if (error instanceof WorkflowError) {
        throw error;
      }

      console.error("Error fetching workflows:", error);
      throw new AppError(
        "Failed to fetch workflows",
        500,
        "WORKFLOW_FETCH_ERROR"
      );
    }
  }

  public async fetchWorkFlowById(id: string, userId: number) {
    try {
      const workflow = await this.workflowRepo.getWorkFlowById(id, userId);

      if (!workflow) {
        throw new WorkflowNotFoundError();
      }

      return workflow;
    } catch (error) {
      if (error instanceof WorkflowError) {
        throw error;
      }

      console.error("Error fetching workflow:", error);
      throw new AppError(
        "Failed to fetch workflow",
        500,
        "WORKFLOW_FETCH_ERROR"
      );
    }
  }

  public async updateWorkflow(parsedData: { data: WorkflowInterface }) {
    return await this.prisma.$transaction(async (tx) => {
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
  }

  public async deleteWorkflow(id: string) {
    return await this.prisma.$transaction(async (tx) => {
      const workflowRunCount = await tx.workflowRun.count({
        where: { workflowId: id },
      });

      if (workflowRunCount > 0) {
        await tx.workflowRun.deleteMany({
          where: { workflowId: id },
        });
      }

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
  }
}
