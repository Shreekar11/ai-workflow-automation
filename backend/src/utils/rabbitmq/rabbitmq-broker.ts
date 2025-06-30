import amqp, { Connection, Channel } from "amqplib";

export class RabbitMQBroker {
  private connection: any | null = null;
  private channel: any | null = null;
  private readonly url: string;
  private readonly queueName: string;

  constructor(url?: string, queueName: string = "template_processing_queue") {
    this.url = url || process.env.RABBITMQ_URL || "amqp://localhost:5672";
    this.queueName = queueName;
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection?.createChannel();

      // Declare the queue with durability for persistence
      await this.channel?.assertQueue(this.queueName, {
        durable: true, // Queue survives broker restarts
        arguments: {
          "x-message-ttl": 3600000, // Messages expire after 1 hour
        },
      });

      console.log(
        `Connected to RabbitMQ and queue '${this.queueName}' is ready`
      );
    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  async publishMessage(message: any): Promise<boolean> {
    if (!this.channel) {
      throw new Error(
        "RabbitMQ channel not initialized. Call connect() first."
      );
    }

    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));

      const published = this.channel.sendToQueue(
        this.queueName,
        messageBuffer,
        {
          persistent: true, // Message survives broker restarts
          timestamp: Date.now(),
          messageId: `msg_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
        }
      );

      if (published) {
        console.log("Message published to RabbitMQ queue successfully");
        return true;
      } else {
        console.warn("Message could not be published - queue may be full");
        return false;
      }
    } catch (error) {
      console.error("Error publishing message to RabbitMQ:", error);
      throw error;
    }
  }

  async consumeMessages(
    callback: (message: any) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error(
        "RabbitMQ channel not initialized. Call connect() first."
      );
    }

    try {
      // Set prefetch to process one message at a time
      await this.channel.prefetch(1);

      await this.channel.consume(this.queueName, async (msg: any) => {
        if (msg) {
          try {
            const messageContent = JSON.parse(msg.content.toString());
            await callback(messageContent);

            // Acknowledge message after successful processing
            this.channel!.ack(msg);
          } catch (error) {
            console.error("Error processing message:", error);

            // Reject message and requeue it for retry
            this.channel!.nack(msg, false, true);
          }
        }
      });

      console.log("Started consuming messages from RabbitMQ queue");
    } catch (error) {
      console.error("Error setting up message consumer:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      console.log("Disconnected from RabbitMQ");
    } catch (error) {
      console.error("Error disconnecting from RabbitMQ:", error);
    }
  }

  async getQueueInfo(): Promise<{
    messageCount: number;
    consumerCount: number;
  }> {
    if (!this.channel) {
      throw new Error(
        "RabbitMQ channel not initialized. Call connect() first."
      );
    }

    try {
      const queueInfo = await this.channel.checkQueue(this.queueName);
      return {
        messageCount: queueInfo.messageCount,
        consumerCount: queueInfo.consumerCount,
      };
    } catch (error) {
      console.error("Error getting queue info:", error);
      throw error;
    }
  }
}
