import { Workflow } from "@prisma/client";
import Repository from "./base.repo";

interface WorkflowInterface {
  id?: string | undefined;
  name: string;
  availableTriggerId: string;
  actions: {
    availableActionId: string;
    actionMetadata?: any;
  }[];
  triggerMetadata?: any;
}
export default class WorkFlowRepo extends Repository<Workflow> {
  constructor() {
    super("workflow");
  }

  public async getWorkFlowById(
    id: string,
    userId: number | undefined
  ): Promise<Workflow | null> {
    const workFlowData = await this.model.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        actions: {
          include: {
            type: true,
          },
        },
        trigger: {
          include: {
            type: true,
          },
        },
      },
    });

    return workFlowData;
  }

  public async getAllUsersWorkFlow(userId: number): Promise<Workflow[]> {
    const workFlowData = await this.model.findMany({
      where: {
        userId,
      },
      include: {
        actions: {
          include: {
            type: true,
          },
        },
        trigger: {
          include: {
            type: true,
          },
        },
      },
    });

    return workFlowData;
  }
}
