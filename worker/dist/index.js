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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = require("kafkajs");
const config_1 = require("./config");
const client_1 = require("@prisma/client");
const parser_1 = require("./utils/parser");
const dotenv_1 = __importDefault(require("dotenv"));
const mail_service_1 = require("./services/mail.service");
dotenv_1.default.config();
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
                var _b, _c, _d, _e, _f, _g, _h;
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
                const workflowRunDetails = yield client.workflowRun.findFirst({
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
                const currentAction = workflowRunDetails === null || workflowRunDetails === void 0 ? void 0 : workflowRunDetails.workflow.actions.find((action) => action.sortingOrder === stage);
                if (!currentAction) {
                    console.log("Current action not found");
                    return;
                }
                // email action
                if (currentAction.type.id === config_1.availableEmailId) {
                    const workflowRunMetadata = workflowRunDetails === null || workflowRunDetails === void 0 ? void 0 : workflowRunDetails.metadata;
                    const to = (0, parser_1.parser)((_e = currentAction.metadata) === null || _e === void 0 ? void 0 : _e.to, workflowRunMetadata);
                    const from = (0, parser_1.parser)((_f = currentAction.metadata) === null || _f === void 0 ? void 0 : _f.from, workflowRunMetadata);
                    const subject = (0, parser_1.parser)((_g = currentAction.metadata) === null || _g === void 0 ? void 0 : _g.subject, workflowRunMetadata);
                    const body = (0, parser_1.parser)((_h = currentAction.metadata) === null || _h === void 0 ? void 0 : _h.body, workflowRunMetadata);
                    const emailService = new mail_service_1.EmailService(to, from, subject, body);
                    yield emailService.sendEmailFunction();
                    console.log(`Sending out Email to ${to}, body is ${body}`);
                }
                const lastStage = ((workflowRunDetails === null || workflowRunDetails === void 0 ? void 0 : workflowRunDetails.workflow.actions.length) || 1) - 1;
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
