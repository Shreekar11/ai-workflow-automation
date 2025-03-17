import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email(),
  clerkUserId: z.string(),
  firstName: z.string().default(""),
  lastName: z.string().default(""),
});

export const WorkflowSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  availableTriggerId: z.string(),
  triggerMetadata: z.any().optional(),
  actions: z.array(
    z.object({
      availableActionId: z.string(),
      actionMetadata: z.any().optional(),
    })
  ),
});

export const TemplateSchema = z.object({
  id: z.string().optional(),
  preTemplateId: z.string().optional(),
  name: z.string(),
  actions: z.array(
    z.object({
      availableActionId: z.string(),
      actionMetadata: z.any().optional(),
    })
  )
})
