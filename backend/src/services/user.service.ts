import { PrismaClient } from "@prisma/client";
import UserRepository from "../repository/user.repo";
import {
  AppError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from "../modules/error";

export class UserService {
  private prisma: PrismaClient;
  private userRepo: UserRepository;

  constructor() {
    this.prisma = new PrismaClient();
    this.userRepo = new UserRepository();
  }

  public async createUser(parsedData: {
    data: {
      clerkUserId: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  }) {
    try {
      const userExists = await this.userRepo.getUserByEmail(
        parsedData.data.email
      );

      if (userExists) {
        throw new UserAlreadyExistsError(parsedData.data.clerkUserId);
      }

      const userData = {
        clerkUserId: parsedData.data.clerkUserId,
        firstName: parsedData.data.firstName,
        lastName: parsedData.data.lastName,
        email: parsedData.data.email.toLowerCase().trim(),
      };

      const createUserData = await this.userRepo.create(userData);
      return createUserData;
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw error;
      }
      throw new AppError("Failed to fetch user data", 500, "USER_FETCH_ERROR");
    }
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
