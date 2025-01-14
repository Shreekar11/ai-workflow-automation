import { PrismaClient } from "@prisma/client";
import { IRepository } from "../interface/repo";

export default class Repository<T extends any> implements IRepository<T> {
  private prisma: PrismaClient;
  private modelName: string;

  constructor(modelName: string) {
    this.prisma = new PrismaClient();
    this.modelName = modelName;
  }

  public get model() {
    return (this.prisma as any)[this.modelName];
  }

  public async get(id: string | number): Promise<T | null> {
    const getData = await this.model.findUnique({
      where: {
        id,
      },
    });

    return getData as T | null;
  }

  public async create(data: any): Promise<T> {
    const createData = await this.model.create({
      data,
    });

    return createData as T;
  }

  public async patch(
    id: string,
    data: Partial<Omit<T, "id">>
  ): Promise<T | null> {
    const updateData = await this.model.update({
      where: {
        id,
      },
      data,
    });

    return updateData as T | null;
  }

  public async delete(id: string): Promise<T | null> {
    const deleteData = await this.model.delete({
      where: {
        id,
      },
    });

    return deleteData as T | null;
  }
}
