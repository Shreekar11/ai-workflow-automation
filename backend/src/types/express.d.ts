import { User } from "@clerk/clerk-sdk-node";

declare global {
  namespace Express {
    interface Request {
      user: User;
      auth?: {
        userId: string;
        sessionId: string;
      };
    }
  }
}

export {}; 