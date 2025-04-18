import { Template } from "@prisma/client";
import Repository from "./base.repo";

export default class TemplateRepository extends Repository<Template> {
  constructor() {
    super("template");
  }

  public async getAllUserTemplates(userId: number): Promise<Template[]> {
    const templates = await this.model.findMany({
      where: {
        userId,
      },
      include: {
        templateResults: true,
        preTemplate: {
          include: {
            availableTemplateActions: true,
          },
        },
        // actions: {
        //   include: {
        //     type: true,
        //   }
        // }
      },
    });

    return templates;
  }

  public async getUserTemplateById(templateId: string): Promise<Template> {
    const template = await this.model.findFirst({
      where: {
        id: templateId,
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
        templateResults: true,
      },
    });

    return template;
  }
}
