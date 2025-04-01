import { createClient, RedisClientType } from "redis";
import { QUEUE_NAME } from "../config";

export class RedisQueue {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor(redisUrl?: string) {
    this.client = createClient({
      url: redisUrl || process.env.REDIS_URL || "redis://localhost:6379",
    });

    this.client.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
      console.log("Connected to Redis");
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      console.log("Disconnected from Redis");
    }
  }

  async pushMessage(message: any): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    const serializedMessage =
      typeof message === "string" ? message : JSON.stringify(message);

    await this.client.lPush(QUEUE_NAME, serializedMessage);
  }

  async popMessage(): Promise<string | null> {
    if (!this.isConnected) {
      await this.connect();
    }

    const result = await this.client.brPop(QUEUE_NAME, 0);
    return result?.element || null;
  }

  getClient(): RedisClientType {
    return this.client;
  }
}
