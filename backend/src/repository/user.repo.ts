import { User } from "@prisma/client";
import Repository from "./base.repo";

export default class UserRepository extends Repository<User> {
  constructor() {
    super("user");
  }

  public async getUserByClerkUserId(clerkUserId: string): Promise<User | null> {
    const userData = await this.model.findFirst({
      where: {
        clerkUserId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        clerkUserId: true,
      },
    });

    return userData;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    const userData = await this.model.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        clerkUserId: true,
      },
    });

    return userData;
  }

  public async getUserById(id: number): Promise<User | null> {
    const userData = await this.model.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        clerkUserId: true,
      },
    });

    return userData;
  }
}
