import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email(),
  clerkUserId: z.string(),
  firstName: z.string().default(""),
  lastName: z.string().default(""),
});