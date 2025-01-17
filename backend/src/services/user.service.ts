import { PrismaClient } from "@prisma/client";
import UserRepository from "../repository/user.repo";
import { AppError, UserNotFoundError } from "../modules/error";

export class UserService {
  private prisma: PrismaClient;
  private userRepo: UserRepository;

  constructor() {
    this.prisma = new PrismaClient();
    this.userRepo = new UserRepository();
  }

  public async fetchUserByClerkId(clerkUserId: string) {
    try {
      const userData = await this.userRepo.getUserByClerkUserId(clerkUserId);
      if (!userData) {
        throw new UserNotFoundError(clerkUserId);
      }
      return userData;
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw error;
      }
      throw new AppError("Failed to fetch user data", 500, "USER_FETCH_ERROR");
    }
  }
}
