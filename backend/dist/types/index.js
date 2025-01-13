"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkFlowSchema = exports.CreateUserSchema = void 0;
const zod_1 = require("zod");
exports.CreateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    clerkUserId: zod_1.z.string(),
    firstName: zod_1.z.string().default(""),
    lastName: zod_1.z.string().default(""),
});
exports.WorkFlowSchema = zod_1.z.object({
    name: zod_1.z.string(),
    availableTriggerId: zod_1.z.string(),
    triggerMetadata: zod_1.z.any().optional(),
    actions: zod_1.z.array(zod_1.z.object({
        availableActionId: zod_1.z.string(),
        actionMetadata: zod_1.z.any().optional(),
    })),
});
