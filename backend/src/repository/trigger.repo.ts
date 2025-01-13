import Repository from "./base.repo";
import { AvailableTrigger } from "@prisma/client";

export default class TriggerRepository extends Repository<AvailableTrigger> {
  constructor() {
    super("availableTrigger");
  }

  public async getAvailableTrigger(
    availableTriggerId: string
  ): Promise<AvailableTrigger | null> {
    const trigger = this.model.findUnique({
      where: {
        id: availableTriggerId,
      },
    });

    return trigger;
  }

  public async getAllAvailableTriggers(): Promise<AvailableTrigger[] | null> {
    const triggers = await this.model.findMany({});
    return triggers;
  }
}
