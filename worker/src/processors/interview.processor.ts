import { PrismaClient } from "@prisma/client";
import { RedisClientType } from "redis";

export async function processInterviewMessage(
  client: PrismaClient,
  redisClient: RedisClientType,
  interviewId: string,
  transcript: any[],
  stage: number
) {
  console.log(`Processing interview message: ${interviewId}`);
}