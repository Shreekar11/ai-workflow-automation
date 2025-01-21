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
const client = new client_1.PrismaClient();
const app = (0, express_1.default)();
// cors configuration
const corsOptions = {
    origin: ["*", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "clerk-user-id", "Authorization"],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
const redisClient = (0, redis_1.createClient)({
    url: "redis://localhost:6379",
});
redisClient.on("error", (err) => console.error("Redis Client Error:", err));
const BATCH_SIZE = 10;
const PROCESSING_INTERVAL = 5000;
app.options("*", (0, cors_1.default)(corsOptions));
app.post("/hooks/:workflowId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const workflowId = req.params.workflowId;
    const body = req.body.data;
    try {
        // store new trigger in db
        yield client.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const run = yield tx.workflowRun.create({
                data: {
                    workflowId,
                    metadata: body,
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
// processor function
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
            setInterval(processOutboxMessages, PROCESSING_INTERVAL);
            app.listen(5000, () => {
                console.log("Server running on port 5000");
            });
            // redis disconnection
            redisClient.on("disconnect", () => {
                console.error("Redis connection lost. Attempting to reconnect...");
            });
            // force shutdown
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
