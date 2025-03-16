import { AvailableTemplateAction } from "@prisma/client";
import Repository from "./base.repo";

export default class TemplateActionRepository extends Repository<AvailableTemplateAction> {
  constructor() {
    super("availableTemplateAction");
  }

  public async getAvailableAction(
    availableActionId: string
  ): Promise<AvailableTemplateAction | null> {
    const action = this.model.findUnique({
      where: {
        id: availableActionId,
      },
    });

    return action;
  }

  public async getAllAvailableActions(): Promise<
    AvailableTemplateAction[] | null
  > {
    const actions = await this.model.findMany({});
    return actions;
  }
}
