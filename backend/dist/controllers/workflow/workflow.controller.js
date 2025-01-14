"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
const types_1 = require("../../types");
const router_1 = require("../../decorators/router");
const workflow_repo_1 = __importDefault(require("../../repository/workflow.repo"));
const client_1 = require("@prisma/client");
const user_repo_1 = __importDefault(require("../../repository/user.repo"));
const constants_1 = require("../../constants");
class WorkFlowController {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    createWorkFlowData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { body } = req;
                const clerkUserId = (_a = req.headers["clerk-user-id"]) === null || _a === void 0 ? void 0 : _a.toString();
                if (!clerkUserId) {
                    return res.status(constants_1.HTTPStatus.UNAUTHORIZED).json({
                        status: false,
                        message: "Unauthorized: Missing user ID",
                    });
                }
                const parsedData = types_1.WorkFlowSchema.safeParse(body);
                if (!parsedData.success) {
                    return res.status(constants_1.HTTPStatus.BAD_REQUEST).json({
                        status: false,
                        message: "Invalid workflow data",
                    });
                }
                const userRepo = new user_repo_1.default();
                const userData = yield userRepo.getUserByClerkUserId(clerkUserId);
                if (!userData) {
                    return res.status(constants_1.HTTPStatus.NOT_FOUND).json({
                        status: false,
                        message: "User not found",
                    });
                }
                const workflow = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const newWorkflow = yield tx.workflow.create({
                        data: {
                            userId: userData.id,
                            name: parsedData.data.name,
                            triggerId: "",
                            actions: {
                                create: parsedData.data.actions.map((item, index) => ({
                                    actionId: item.availableActionId,
                                    sortingOrder: index,
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
                return res.status(constants_1.HTTPStatus.CREATED).json({
                    status: true,
                    message: "Workflow created successfully",
                    data: workflow,
                });
            }
            catch (err) {
                console.error("Error creating workflow:", err);
                return res.status(constants_1.HTTPStatus.INTERNAL_SERVER_ERROR).json({
                    status: false,
                    message: "Failed to create workflow",
                });
            }
        });
    }
    getWorkFlowData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const clerkUserId = (_a = req.headers["clerk-user-id"]) === null || _a === void 0 ? void 0 : _a.toString();
                if (!clerkUserId) {
                    return res.status(constants_1.HTTPStatus.UNAUTHORIZED).json({
                        status: false,
                        message: "Unauthorized: Missing user ID",
                    });
                }
                const userRepo = new user_repo_1.default();
                const userData = yield userRepo.getUserByClerkUserId(clerkUserId);
                if (!userData) {
                    return res.status(constants_1.HTTPStatus.NOT_FOUND).json({
                        status: false,
                        message: "User not found",
                    });
                }
                const workflowRepo = new workflow_repo_1.default();
                const userWorkFlowData = yield workflowRepo.getAllUsersWorkFlow(userData.id);
                return res.status(constants_1.HTTPStatus.OK).json({
                    status: true,
                    message: "Workflows retrieved successfully",
                    data: userWorkFlowData,
                });
            }
            catch (err) {
                console.error("Error fetching workflows:", err);
                return res.status(constants_1.HTTPStatus.INTERNAL_SERVER_ERROR).json({
                    status: false,
                    message: "Failed to fetch workflows",
                });
            }
        });
    }
    getWorkFlowDataById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const clerkUserId = (_a = req.headers["clerk-user-id"]) === null || _a === void 0 ? void 0 : _a.toString();
                if (!clerkUserId) {
                    return res.status(constants_1.HTTPStatus.UNAUTHORIZED).json({
                        status: false,
                        message: "Unauthorized: Missing user ID",
                    });
                }
                if (!id) {
                    return res.status(constants_1.HTTPStatus.BAD_REQUEST).json({
                        status: false,
                        message: "Workflow ID is required",
                    });
                }
                const userRepo = new user_repo_1.default();
                const userData = yield userRepo.getUserByClerkUserId(clerkUserId);
                if (!userData) {
                    return res.status(constants_1.HTTPStatus.NOT_FOUND).json({
                        status: false,
                        message: "User not found",
                    });
                }
                const workflowRepo = new workflow_repo_1.default();
                const workFlowData = yield workflowRepo.getWorkFlowById(id, userData.id);
                if (!workFlowData) {
                    return res.status(constants_1.HTTPStatus.NOT_FOUND).json({
                        status: false,
                        message: "Workflow not found",
                    });
                }
                return res.status(constants_1.HTTPStatus.OK).json({
                    status: true,
                    message: "Workflow retrieved successfully",
                    data: workFlowData,
                });
            }
            catch (err) {
                console.error("Error fetching workflow:", err);
                return res.status(constants_1.HTTPStatus.INTERNAL_SERVER_ERROR).json({
                    status: false,
                    message: "Failed to fetch workflow",
                });
            }
        });
    }
    deleteWorkflow(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const clerkUserId = req.headers["clerk-user-id"];
                if (!clerkUserId) {
                    return res.status(constants_1.HTTPStatus.UNAUTHORIZED).json({
                        status: false,
                        message: "Unauthorized",
                    });
                }
                const existingWorkflow = yield this.prisma.workflow.findUnique({
                    where: { id },
                });
                if (!existingWorkflow) {
                    return res.status(constants_1.HTTPStatus.NOT_FOUND).json({
                        status: false,
                        message: "Workflow not found or already deleted",
                    });
                }
                const deleteWorkflow = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
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
                return res.status(constants_1.HTTPStatus.OK).json({
                    status: true,
                    message: "Workflow and associated data deleted successfully",
                    data: deleteWorkflow,
                });
            }
            catch (err) {
                console.error("err deleting workflow:", err);
                if (err.code === "P2025") {
                    return res.status(constants_1.HTTPStatus.NOT_FOUND).json({
                        status: false,
                        message: "Workflow not found or already deleted",
                    });
                }
                return res.status(constants_1.HTTPStatus.INTERNAL_SERVER_ERROR).json({
                    status: false,
                    message: "Error deleting workflow",
                });
            }
        });
    }
}
exports.default = WorkFlowController;
__decorate([
    (0, router_1.POST)("/api/v1/workflow"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkFlowController.prototype, "createWorkFlowData", null);
__decorate([
    (0, router_1.GET)("/api/v1/workflow"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkFlowController.prototype, "getWorkFlowData", null);
__decorate([
    (0, router_1.GET)("/api/v1/workflow/:id"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkFlowController.prototype, "getWorkFlowDataById", null);
__decorate([
    (0, router_1.DELETE)("/api/v1/workflow/:id"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkFlowController.prototype, "deleteWorkflow", null);
