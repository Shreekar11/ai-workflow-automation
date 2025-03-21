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
exports.RedisQueue = void 0;
const redis_1 = require("redis");
const config_1 = require("../config");
class RedisQueue {
    constructor(redisUrl) {
        this.isConnected = false;
        this.client = (0, redis_1.createClient)({
            url: redisUrl || process.env.REDIS_URL || "redis://localhost:6379",
        });
        this.client.on("error", (err) => {
            console.error("Redis Client Error:", err);
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected) {
                yield this.client.connect();
                this.isConnected = true;
                console.log("Connected to Redis");
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isConnected) {
                yield this.client.quit();
                this.isConnected = false;
                console.log("Disconnected from Redis");
            }
        });
    }
    pushMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected) {
                yield this.connect();
            }
            const serializedMessage = typeof message === "string" ? message : JSON.stringify(message);
            yield this.client.lPush(config_1.QUEUE_NAME, serializedMessage);
        });
    }
    popMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected) {
                yield this.connect();
            }
            const result = yield this.client.brPop(config_1.QUEUE_NAME, 0);
            return (result === null || result === void 0 ? void 0 : result.element) || null;
        });
    }
    getClient() {
        return this.client;
    }
}
exports.RedisQueue = RedisQueue;
