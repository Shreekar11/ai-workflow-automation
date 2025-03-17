import { PrismaClient, User } from "@prisma/client";

export default class TemplateService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  public async createTemplate(user: User, template: any) {
    const data = await this.prisma.$transaction(async (tx) => {
      const templateData = await tx.template.create({
        data: {
          userId: user.id,
          preTemplateId: template.data.preTemplateId || "",
          name: template.data.name,
          actions: {
            create: template.data.actions.map(
              (
                item: {
                  availableActionId: string;
                  sortingOrder: number;
                  actionMetadata: any;
                },
                index: number
              ) => ({
                actionId: item.availableActionId,
                sortingOrder: index,
                metadata: item.actionMetadata,
              })
            ),
          },
        },
        include: {
          actions: true,
        },
      });

      return templateData;
    });

    return data;
  }
}
