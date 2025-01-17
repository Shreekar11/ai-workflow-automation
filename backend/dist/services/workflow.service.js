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
exports.WorkflowService = void 0;
const client_1 = require("@prisma/client");
const workflow_repo_1 = __importDefault(require("../repository/workflow.repo"));
class WorkflowService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.workflowRepo = new workflow_repo_1.default();
    }
    createWorkflow(userData, parsedData) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const newWorkflow = yield tx.workflow.create({
                    data: {
                        userId: userData.id,
                        name: parsedData.data.name,
                        triggerId: "",
                        actions: {
                            create: parsedData.data.actions.map((item, index) => ({
                                actionId: item.availableActionId,
                                sortingOrder: index,
                                metadata: item.actionMetadata,
                            })),
                        },
                    },
                    include: {
                        actions: true,
                    },
                });
                const trigger = yield tx.trigger.create({
                    data: {
                        triggerId: parsedData.data.availableTriggerId,
                        workflowId: newWorkflow.id,
                        metadata: parsedData.data.triggerMetadata,
                    },
                });
                return yield tx.workflow.update({
                    where: { id: newWorkflow.id },
                    data: { triggerId: trigger.id },
                    include: {
                        actions: true,
                        trigger: true,
                    },
                });
            }));
        });
    }
    fetchAllWorkflows(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const workflows = yield this.workflowRepo.getAllUsersWorkFlow(userData.id);
            return workflows;
        });
    }
}
exports.WorkflowService = WorkflowService;
