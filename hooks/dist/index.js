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
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const config_1 = require("./config");
const node_cron_1 = __importDefault(require("node-cron"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const client = new client_1.PrismaClient();
const app = (0, express_1.default)();
dotenv_1.default.config();
const corsOptions = {
    origin: [
        "*",
        "https://workflows-flax.vercel.app",
        "https://clerk.com",
        "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "clerk-user-id",
        "Authorization",
        "clerk-session-id",
        "x-csrf-token",
    ],
    credentials: true,
    maxAge: 600,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
});
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});
redisClient.on("error", (err) => console.error("Redis Client Error:", err));
const BATCH_SIZE = 10;
const PROCESSING_INTERVAL = 5000;
app.options("*", (0, cors_1.default)(corsOptions));
function initHealthCheck() {
    const healthCheckUrl = process.env.WEBHOOK_URL;
    if (!healthCheckUrl) {
        console.error("WEBHOOK_URL not configured for health check");
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
app.post("/hooks/:workflowId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const workflowId = req.params.workflowId;
    const body = req.body.data;
    try {
        yield client.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const run = yield tx.workflowRun.create({
                data: {
                    workflowId,
                    metadata: body,
                    status: "running",
                },
            });
            yield tx.workflowRunOutbox.create({
                data: {
                    workflowRunId: run.id,
                },
            });
        }));
        res.status(200).json({ status: true, message: "Webhook Trigger received" });
    }
    catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
}));
function processOutboxMessages() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pendingRows = yield client.workflowRunOutbox.findMany({
                where: {},
                take: BATCH_SIZE,
            });
            if (pendingRows.length > 0) {
                const pipeline = redisClient.multi();
                pendingRows.forEach((item) => {
                    const message = JSON.stringify({
                        workflowRunId: item.workflowRunId,
                        stage: 0,
                    });
                    pipeline.lPush(config_1.QUEUE_NAME, message);
                });
                yield pipeline.exec();
                yield client.workflowRunOutbox.deleteMany({
                    where: {
                        id: {
                            in: pendingRows.map((item) => item.id),
                        },
                    },
                });
                console.log(`Processed ${pendingRows.length} messages`);
            }
        }
        catch (error) {
            console.error("Error processing outbox messages:", error);
        }
    });
}
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redisClient.connect();
            console.log("Connected to Redis");
            initHealthCheck();
            setInterval(processOutboxMessages, PROCESSING_INTERVAL);
            app.listen(5000, () => {
                console.log("Server running on port 5000");
            });
            app.get("/", (req, res) => {
                return res.status(200).json({
                    message: "Hooks server is running",
                });
            });
            redisClient.on("disconnect", () => {
                console.error("Redis connection lost. Attempting to reconnect...");
            });
            process.on("SIGTERM", () => __awaiter(this, void 0, void 0, function* () {
                console.log("Shutting down server...");
                yield redisClient.quit();
                yield client.$disconnect();
                process.exit(0);
            }));
        }
        catch (error) {
            console.error("Failed to start server:", error);
            process.exit(1);
        }
    });
}
process.on("unhandledRejection", (error) => {
    console.error("Unhandled promise rejection:", error);
});
startServer().catch(console.error);
