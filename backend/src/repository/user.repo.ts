import { User } from "@prisma/client";
import Repository from "./base.repo";

export default class UserRepository extends Repository<User> {
  constructor() {
    super("user");
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    const userData = await this.model.findUnique({
      where: {
        email,
      },
    });

    return userData;
  }

  public async getUserById(id: string): Promise<User | null> {
    const userData = await this.model.findUnique({
      where: {
        id,
      },
    });

    return userData;
  }
}
