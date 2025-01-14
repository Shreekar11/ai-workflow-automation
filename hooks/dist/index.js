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
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const client = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post("/hooks/:workflowId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const workflowId = req.params.workflowId;
    const body = req.body;
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
    res.json({ message: "Webhook Trigger received" });
}));
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
