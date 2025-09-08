import { PrismaClient } from "@prisma/client";
import { RedisClientType } from "redis";

export async function processInterviewMessage(
  client: PrismaClient,
  redisClient: RedisClientType,
  interviewId: string,
  transcript: any[],
  stage: number
) {
  try {
    const [interview_id, authId] = interviewId.split("&");

    // Formatting transcription data
    const formattedTranscript = [];
    for (let i = 0; i < transcript.length; i += 2) {
      formattedTranscript.push({
        assistant: transcript[i][1] || "",
        client: transcript[i + 1]?.[1] || "",
      });
    }

  } catch (err: any) {
    console.error("Error: ", err);
  }
}