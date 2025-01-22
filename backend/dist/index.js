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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const logger_1 = __importDefault(require("./modules/logger"));
const initializer_1 = __importDefault(require("./initializer"));
const client_1 = require("@prisma/client");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const node_cron_1 = __importDefault(require("node-cron"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
class Server {
    constructor() {
        this.port = Number(process.env.PORT) || 8080;
        this.log = (req, res, next) => {
            res.on("finish", () => {
                logger_1.default.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${res.statusMessage} ${res.get("Content-Length") || 0}`);
            });
            next();
        };
        this.app = (0, express_1.default)();
        this.prisma = new client_1.PrismaClient();
        this.initHealthCheck();
    }
    initHealthCheck() {
        const healthCheckUrl = process.env.BACKEND_URL;
        node_cron_1.default.schedule("*/5 * * * *", () => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(healthCheckUrl);
                logger_1.default.info(`Health check succeeded: ${response.status}`);
            }
            catch (error) {
                logger_1.default.error(`Health check failed: ${error.message}`);
            }
        }));
        logger_1.default.info("Health check cron job initialized");
    }
    static get fn() {
        return this.instance;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.$connect();
            console.log("Database connected successfully");
            // cors configuration
            const corsOptions = {
                origin: [
                    "*",
                    "https://workflows-flax.vercel.app",
                    "http://localhost:3000",
                    "https://clerk.com",
                ].filter(Boolean),
                methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
                allowedHeaders: [
                    "Content-Type",
                    "Authorization",
                    "x-csrf-token",
                    "clerk-session-id",
                    "clerk-user-id",
                ],
                credentials: true,
                maxAge: 600,
            };
            this.app.use(body_parser_1.default.json());
            this.app.use(body_parser_1.default.urlencoded({
                extended: true,
            }));
            this.app.use((0, clerk_sdk_node_1.ClerkExpressWithAuth)());
            this.app.use((0, cors_1.default)(corsOptions));
            // security headers
            this.app.use((req, res, next) => {
                res.setHeader("X-Content-Type-Options", "nosniff");
                res.setHeader("X-Frame-Options", "DENY");
                res.setHeader("X-XSS-Protection", "1; mode=block");
                res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
                next();
            });
            this.app.use(this.log);
            new initializer_1.default().init(this.app);
            this.app.get("/", (req, res) => {
                return res.status(200).json({
                    message: "Server running",
                });
            });
            this.app.listen(this.port, () => {
                console.log(`Server is running on port ${this.port}`);
            });
        });
    }
}
_a = Server;
Server.instance = new _a();
Server.fn.start();
