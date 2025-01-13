import Repository from "./base.repo";
import { AvailableAction } from "@prisma/client";

export default class ActionRepository extends Repository<AvailableAction> {
  constructor() {
    super("availableAction");
  }

  public async getAvailableAction(
    availableActionId: string
  ): Promise<AvailableAction | null> {
    const action = this.model.findUnique({
      where: {
        id: availableActionId,
      },
    });

    return action;
  }

  public async getAllAvailableActions(): Promise<AvailableAction[] | null> {
    const actions = await this.model.findMany({});
    return actions;
  }
}
