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
const http_1 = __importDefault(require("http"));
const redis_1 = require("redis");
const config_1 = require("./config");
const client_1 = require("@prisma/client");
const parser_1 = require("./utils/parser");
const dotenv_1 = __importDefault(require("dotenv"));
const mail_service_1 = require("./services/mail.service");
const sheets_service_1 = require("./services/sheets.service");
const node_cron_1 = __importDefault(require("node-cron"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const client = new client_1.PrismaClient();
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});
redisClient.on("error", (err) => console.error("Redis Client Error:", err));
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
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            const parsedValue = JSON.parse(message);
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
            try {
                // email action
                if (currentAction.type.id === config_1.availableEmailId) {
                    const workflowRunMetadata = workflowRunDetails === null || workflowRunDetails === void 0 ? void 0 : workflowRunDetails.metadata;
                    const to = (0, parser_1.parser)((_a = currentAction.metadata) === null || _a === void 0 ? void 0 : _a.to, workflowRunMetadata);
                    const from = (0, parser_1.parser)((_b = currentAction.metadata) === null || _b === void 0 ? void 0 : _b.from, workflowRunMetadata);
                    const subject = (0, parser_1.parser)((_c = currentAction.metadata) === null || _c === void 0 ? void 0 : _c.subject, workflowRunMetadata);
                    const body = (0, parser_1.parser)((_d = currentAction.metadata) === null || _d === void 0 ? void 0 : _d.body, workflowRunMetadata);
                    const emailService = new mail_service_1.EmailService(to, from, subject, body);
                    yield emailService.sendEmailFunction();
                    console.log(`Sending out Email to ${to}, body is ${body}`);
                    yield client.workflowRun.update({
                        where: { id: workflowRunDetails === null || workflowRunDetails === void 0 ? void 0 : workflowRunDetails.id },
                        data: { status: "completed" },
                    });
                }
                // google sheets action
                if (currentAction.type.id === config_1.availableGoogleSheetsId) {
                    const workflowRunMetadata = workflowRunDetails === null || workflowRunDetails === void 0 ? void 0 : workflowRunDetails.metadata;
                    const sheetId = (0, parser_1.parser)((_e = currentAction.metadata) === null || _e === void 0 ? void 0 : _e.sheetId, workflowRunMetadata);
                    let range = (0, parser_1.parser)((_f = currentAction.metadata) === null || _f === void 0 ? void 0 : _f.range, workflowRunMetadata);
                    if (range.startsWith("Sheet!")) {
                        range = range.replace("Sheet!", "Sheet1!");
                    }
                    else {
                        range = `Sheet1!${range}`;
                    }
                    const valuesStr = (0, parser_1.parser)((_g = currentAction.metadata) === null || _g === void 0 ? void 0 : _g.values, workflowRunMetadata);
                    const values = valuesStr.split(",");
                    const sheetsService = new sheets_service_1.GoogleSheetsService(sheetId, range, values);
                    yield sheetsService.appendToSheet();
                    console.log(`Added row to Google Sheet ${sheetId} in range ${range}`);
                    yield client.workflowRun.update({
                        where: { id: workflowRunDetails === null || workflowRunDetails === void 0 ? void 0 : workflowRunDetails.id },
                        data: { status: "completed" },
                    });
                }
            }
            catch (error) {
                yield client.workflowRun.update({
                    where: { id: workflowRunDetails === null || workflowRunDetails === void 0 ? void 0 : workflowRunDetails.id },
                    data: {
                        status: "failed",
                    },
                });
                throw error;
            }
            const lastStage = ((workflowRunDetails === null || workflowRunDetails === void 0 ? void 0 : workflowRunDetails.workflow.actions.length) || 1) - 1;
            if (lastStage !== stage) {
                const nextMessage = JSON.stringify({
                    stage: stage + 1,
                    workflowRunId,
                });
                yield redisClient.lPush(config_1.QUEUE_NAME, nextMessage);
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
            yield redisClient.connect();
            console.log("Connected to Redis");
            initHealthCheck();
            // start processing messages
            while (true) {
                try {
                    const result = yield redisClient.brPop(config_1.QUEUE_NAME, 0);
                    if (result) {
                        const message = result.element;
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
const server = http_1.default.createServer((req, res) => {
    if (req.url === "/" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Worker is running" }));
    }
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not Found" }));
    }
});
server.listen(8000, () => {
    console.log("Worker HTTP server listening on port 8000");
});
// force shutdown
process.on("SIGTERM", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Shutting down worker...");
    yield redisClient.quit();
    yield client.$disconnect();
    server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
    });
}));
process.on("unhandledRejection", (error) => {
    console.error("Unhandled promise rejection:", error);
});
main().catch(console.error);
