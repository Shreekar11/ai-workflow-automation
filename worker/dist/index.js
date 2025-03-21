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
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const node_cron_1 = __importDefault(require("node-cron"));
const axios_1 = __importDefault(require("axios"));
const workflow_processor_1 = require("./processors/workflow.processor");
const redis_queue_1 = require("./queue/redis.queue");
const server_1 = require("./server");
const template_processor_1 = require("./processors/template.processor");
dotenv_1.default.config();
const client = new client_1.PrismaClient();
const redisQueue = new redis_queue_1.RedisQueue();
const server = new server_1.Server(8000);
// cron job
function initHealthCheck() {
    const healthCheckUrl = process.env.WORKER_URL;
    if (!healthCheckUrl) {
        console.error("WORKER_URL not configured for health check");
        return;
    }
    node_cron_1.default.schedule("*/5 * * * *", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(healthCheckUrl);
            console.log(`Health check succeeded: ${response.status}`);
        }
        catch (error) {
            console.error(`Health check failed: ${error.message}`);
        }
    }));
    console.log("Health check cron job initialized");
}
function processMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const parsedValue = JSON.parse(message);
            const workflowRunId = parsedValue.workflowRunId;
            const templateId = parsedValue.templateId;
            const stage = parsedValue.stage;
            if (workflowRunId) {
                yield (0, workflow_processor_1.processWorkflowMessage)(client, redisQueue.getClient(), workflowRunId, stage);
            }
            if (templateId) {
                yield (0, template_processor_1.processTemplateMessage)(client, redisQueue.getClient(), templateId, stage);
            }
            console.log("Processing completed");
        }
        catch (error) {
            console.error("Error processing message:", error);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redisQueue.connect();
            server.start();
            initHealthCheck();
            // start processing messages
            while (true) {
                try {
                    const message = yield redisQueue.popMessage();
                    if (message) {
                        yield processMessage(message);
                    }
                }
                catch (error) {
                    console.error("Error processing queue message:", error);
                    yield new Promise((resolve) => setTimeout(resolve, 1000));
                }
            }
        }
        catch (error) {
            console.error("Failed to start worker:", error);
            process.exit(1);
        }
    });
}
// force shutdown
process.on("SIGTERM", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Shutting down worker...");
    yield redisQueue.disconnect();
    yield client.$disconnect();
    yield server.shutdown();
    process.exit(0);
}));
process.on("unhandledRejection", (error) => {
    console.error("Unhandled promise rejection:", error);
});
main().catch(console.error);
