"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const kafkajs_1 = require("kafkajs");
const client = new client_1.PrismaClient();
const kafka = new kafkajs_1.Kafka({
    clientId: "outbox-processor",
    brokers: ["localhost:9092"],
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // connects to the kafka broker
        const producer = kafka.producer();
        yield producer.connect();
        //   $ bin/kafka-console-consumer.sh --topic quickstart-events --from-beginning --bootstrap-server localhost:9092
        while (1) {
            // fetches the pending rows from the outbox table
            const pendingRows = yield client.zapRunOutBox.findMany({
                where: {},
                take: 10,
            });
            // the producer sends the zapRunId to the kafka queue
            producer.send({
                topic: "zap-events",
                messages: pendingRows.map((item) => ({ value: item.zapRunId })),
            });
            // after the pending rows are sent to the kafka queue, they are deleted from the outbox table
            yield client.zapRunOutBox.deleteMany({
                where: {
                    id: {
                        in: pendingRows.map((item) => item.id),
                    },
                },
            });
        }
    });
}
main();
