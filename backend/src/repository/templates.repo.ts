import { Template } from "@prisma/client";
import Repository from "./base.repo";

export default class TemplateRepository extends Repository<Template> {
  constructor() {
    super("template");
  }

  public async getUserTemplates(userId: number): Promise<Template> {
    const templates = await this.model.findMany({
      where: {
        userId,
      },
    });

    return templates;
  }

  public async getUserTemplateById(templateId: string): Promise<Template> {
    const template = await this.model.findFirst({
      where: {
        templateId,
      },
    });

    return template;
  }
}
