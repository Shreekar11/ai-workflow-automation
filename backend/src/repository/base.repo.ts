import { PrismaClient } from "@prisma/client";

export default class Repository {
  private prisma: PrismaClient;
  private modelName: string;

  constructor(modelName: string) {
    this.prisma = new PrismaClient();
    this.modelName = modelName;
  }

  public get model() {
    return (this.prisma as any)[this.modelName];
  }

  public async get(id: string) {
    const getData = await this.model.findUnique({
      where: {
        id,
      },
    });

    return getData;
  }

  public async create(data: any) {
    const createData = await this.model.create({
      data,
    });

    return createData;
  }

  public async patch(id: string, data: Partial<"id">) {
    const updateData = await this.model.update({
      where: {
        id,
      },
      data,
    });

    return updateData;
  }

  public async delete(id: string) {
    const deleteData = await this.model.delete({
      where: {
        id,
      },
    });

    return deleteData;
  }
}
