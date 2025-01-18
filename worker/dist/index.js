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
const kafkajs_1 = require("kafkajs");
const config_1 = require("./config");
const client_1 = require("@prisma/client");
const client = new client_1.PrismaClient();
const kafka = new kafkajs_1.Kafka({
    clientId: "outbox-worker",
    brokers: ["localhost:9092"],
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const consumer = kafka.consumer({ groupId: "outbox-worker" });
        yield consumer.connect();
        const producer = kafka.producer();
        yield producer.connect();
        yield consumer.subscribe({
            topic: config_1.TOPIC_NAME,
            fromBeginning: true,
        });
        yield consumer.run({
            autoCommit: false,
            eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ topic, partition, message }) {
                var _b, _c, _d;
                console.log({
                    partition,
                    offset: message.offset,
                    value: (_b = message.value) === null || _b === void 0 ? void 0 : _b.toString(),
                });
                if (!((_c = message.value) === null || _c === void 0 ? void 0 : _c.toString())) {
                    return;
                }
                const parsedValue = JSON.parse((_d = message.value) === null || _d === void 0 ? void 0 : _d.toString());
                const workflowRunId = parsedValue.workflowRunId;
                const stage = parsedValue.stage;
                const workflowDetails = yield client.workflowRun.findFirst({
                    where: {
                        id: workflowRunId,
                    },
                    include: {
                        workflow: {
                            include: {
                                actions: {
                                    include: {
                                        type: true,
                                    },
                                },
                            },
                        },
                    },
                });
                const currentAction = workflowDetails === null || workflowDetails === void 0 ? void 0 : workflowDetails.workflow.actions.find((action) => action.sortingOrder === stage);
                if (!currentAction) {
                    console.log("Current action not found");
                    return;
                }
                // email action
                if (currentAction.type.id === config_1.availableEmailId) {
                    console.log("Sending out Email");
                }
                // solana action
                if (currentAction.type.id === config_1.availableSolanaId) {
                    console.log("Sending out Solana");
                }
                const lastStage = ((workflowDetails === null || workflowDetails === void 0 ? void 0 : workflowDetails.workflow.actions.length) || 1) - 1;
                if (lastStage !== stage) {
                    yield producer.send({
                        topic: config_1.TOPIC_NAME,
                        messages: [
                            {
                                value: JSON.stringify({
                                    stage: stage + 1,
                                    workflowRunId,
                                }),
                            },
                        ],
                    });
                }
                console.log("Processing completed");
                yield consumer.commitOffsets([
                    {
                        topic: config_1.TOPIC_NAME,
                        partition,
                        offset: (parseInt(message.offset) + 1).toString(),
                    },
                ]);
            }),
        });
    });
}
main();
