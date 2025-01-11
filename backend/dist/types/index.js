"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserSchema = void 0;
const zod_1 = require("zod");
exports.CreateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    clerkUserId: zod_1.z.string(),
    firstName: zod_1.z.string().default(""),
    lastName: zod_1.z.string().default(""),
});
