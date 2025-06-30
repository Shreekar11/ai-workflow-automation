import { RabbitMQBroker } from "./rabbitmq-broker";

export class RabbitMQSingleton {
  private static instance: RabbitMQBroker | null = null;

  static getInstance(url?: string, queueName?: string): RabbitMQBroker {
    if (!RabbitMQSingleton.instance) {
      RabbitMQSingleton.instance = new RabbitMQBroker(url, queueName);
    }
    return RabbitMQSingleton.instance;
  }

  static async ensureConnection(): Promise<RabbitMQBroker> {
    const instance = RabbitMQSingleton.getInstance();

    try {
      // Test if connection is alive
      await instance.getQueueInfo();
      return instance;
    } catch (error) {
      // Reconnect if connection is dead
      await instance.connect();
      return instance;
    }
  }
}
