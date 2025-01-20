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
const error_1 = require("../modules/error");
class WorkflowService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.workflowRepo = new workflow_repo_1.default();
    }
    createWorkflow(userData, parsedData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    try {
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
                    }
                    catch (error) {
                        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                            switch (error.code) {
                                case "P2002":
                                    throw new error_1.WorkflowCreateError("A workflow with this name already exists");
                                case "P2003":
                                    throw new error_1.WorkflowCreateError("Invalid reference to action or trigger");
                                default:
                                    throw new error_1.WorkflowCreateError("Failed to create workflow due to database constraint");
                            }
                        }
                        throw error;
                    }
                }), {
                    maxWait: 5000,
                    timeout: 10000,
                });
            }
            catch (error) {
                if (error instanceof error_1.WorkflowError) {
                    throw error;
                }
                console.error("Unexpected error in createWorkflow:", error);
                throw new error_1.WorkflowCreateError("An unexpected error occurred while creating the workflow");
            }
        });
    }
    fetchAllWorkflows(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workflows = yield this.workflowRepo.getAllUsersWorkFlow(userData.id);
                if (!workflows || workflows.length === 0) {
                    throw new error_1.WorkflowNotFoundError();
                }
                return workflows;
            }
            catch (error) {
                if (error instanceof error_1.WorkflowError) {
                    throw error;
                }
                console.error("Error fetching workflows:", error);
                throw new error_1.AppError("Failed to fetch workflows", 500, "WORKFLOW_FETCH_ERROR");
            }
        });
    }
    fetchWorkFlowById(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workflow = yield this.workflowRepo.getWorkFlowById(id, userId);
                if (!workflow) {
                    throw new error_1.WorkflowNotFoundError();
                }
                return workflow;
            }
            catch (error) {
                if (error instanceof error_1.WorkflowError) {
                    throw error;
                }
                console.error("Error fetching workflow:", error);
                throw new error_1.AppError("Failed to fetch workflow", 500, "WORKFLOW_FETCH_ERROR");
            }
        });
    }
    updateWorkflow(parsedData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                yield tx.workflow.update({
                    where: {
                        id: parsedData.data.id,
                    },
                    data: {
                        name: parsedData.data.name,
                    },
                });
                // delete earlier actions and create new to update them
                yield tx.action.deleteMany({
                    where: {
                        workflowId: parsedData.data.id,
                    },
                });
                // new actions created
                if (parsedData.data.actions.length > 0) {
                    yield tx.action.createMany({
                        data: parsedData.data.actions.map((item, index) => ({
                            workflowId: parsedData.data.id || "",
                            actionId: item.availableActionId,
                            metadata: item.actionMetadata || {},
                            sortingOrder: index,
                        })),
                    });
                }
                const updatedData = yield tx.workflow.findUnique({
                    where: {
                        id: parsedData.data.id,
                    },
                    include: {
                        actions: {
                            include: {
                                type: true,
                            },
                            orderBy: {
                                sortingOrder: "asc",
                            },
                        },
                        trigger: {
                            include: {
                                type: true,
                            },
                        },
                    },
                });
                return updatedData;
            }));
        });
    }
    deleteWorkflow(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const workflowRunCount = yield tx.workflowRun.count({
                    where: { workflowId: id },
                });
                if (workflowRunCount > 0) {
                    yield tx.workflowRun.deleteMany({
                        where: { workflowId: id },
                    });
                }
                const triggerCount = yield tx.trigger.count({
                    where: { workflowId: id },
                });
                if (triggerCount > 0) {
                    yield tx.trigger.delete({
                        where: { workflowId: id },
                    });
                }
                const actionCount = yield tx.action.count({
                    where: { workflowId: id },
                });
                if (actionCount > 0) {
                    yield tx.action.deleteMany({
                        where: { workflowId: id },
                    });
                }
                return yield tx.workflow.delete({
                    where: { id },
                });
            }));
        });
    }
}
exports.WorkflowService = WorkflowService;
