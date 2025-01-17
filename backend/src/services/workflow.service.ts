import { PrismaClient } from "@prisma/client";
import WorkFlowRepo from "../repository/workflow.repo";
import { WorkflowInterface } from "../interface/workflow";
import { UserInterface } from "../interface/user";

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
    await this.prisma.$transaction(async (tx) => {
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
  }

  public async fetchAllWorkflows(userData: UserInterface) {
    const workflows = await this.workflowRepo.getAllUsersWorkFlow(userData.id);

    return workflows;
  }
}
