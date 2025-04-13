import { PreTemplate } from "@prisma/client";
import Repository from "./base.repo";

export default class PreTemplateRepository extends Repository<PreTemplate> {
  constructor() {
    super("preTemplate");
  }

  public async getPreTemplatById(
    templateId: string
  ): Promise<PreTemplate | null> {
    try {
      const preTemplate = await this.model.findUnique({
        where: { id: templateId },
        include: {
          availableTemplateActions: true,
        },
      });

      if (!preTemplate) {
        throw new Error("PreTemplate not found");
      }

      return preTemplate;
    } catch (error) {
      console.error("Error fetching PreTemplate:", error);
      throw new Error("Failed to fetch PreTemplate");
    }
  }

  public async getAllPreTemplates(): Promise<PreTemplate[]> {
    try {
      const preTemplates = await this.model.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          availableTemplateActions: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });

      return preTemplates;
    } catch (error) {
      console.error("Error fetching PreTemplates:", error);
      throw new Error("Failed to fetch PreTemplates");
    }
  }
}
