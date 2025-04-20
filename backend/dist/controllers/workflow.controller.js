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
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const router_1 = require("../decorators/router");
const client_1 = require("@prisma/client");
const constants_1 = require("../constants");
const workflow_service_1 = require("../services/workflow.service");
const user_service_1 = require("../services/user.service");
const error_1 = require("../modules/error");
const middlewares_1 = require("../middlewares");
class WorkflowController {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.workflowService = new workflow_service_1.WorkflowService();
        this.userService = new user_service_1.UserService();
    }
    createWorkFlowData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield middlewares_1.AuthMiddleware.verifyToken(req, res, () => { });
            try {
                const { body } = req;
                const user = req.user;
                const parsedData = types_1.WorkflowSchema.safeParse(body);
                if (!parsedData.success) {
                    return res.status(constants_1.HTTPStatus.BAD_REQUEST).json({
                        status: false,
                        message: "Invalid workflow data",
                    });
                }
                let userData;
                try {
                    userData = yield this.userService.fetchUserByClerkId(user.id);
                }
                catch (error) {
                    if (error instanceof error_1.UserNotFoundError) {
                        return res.status(constants_1.HTTPStatus.NOT_FOUND).json({
                            status: false,
                            message: error.message,
                        });
                    }
                    throw error;
                }
                // after creating the worflow with webhook trigger, create a webhook secret key for the workflow
                const workflow = yield this.workflowService.createWorkflow(userData, parsedData);
                const webhookSecret = yield this.prisma.webhookKey.findFirst({
                    where: {
                        triggerId: workflow.triggerId,
                    },
                });
                return res.status(constants_1.HTTPStatus.CREATED).json({
                    status: true,
                    message: "Workflow created successfully",
                    data: Object.assign(Object.assign({}, workflow), { webhookSecret: webhookSecret === null || webhookSecret === void 0 ? void 0 : webhookSecret.secretKey }),
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
            yield middlewares_1.AuthMiddleware.verifyToken(req, res, () => { });
            const user = req.user;
            try {
                let userData;
                try {
                    userData = yield this.userService.fetchUserByClerkId(user.id);
                }
                catch (error) {
                    if (error instanceof error_1.UserNotFoundError) {
                        return res.status(constants_1.HTTPStatus.NOT_FOUND).json({
                            status: false,
                            message: error.message,
                        });
                    }
                    throw error;
                }
                try {
                    const userWorkFlowData = yield this.workflowService.fetchAllWorkflows(userData);
                    return res.status(constants_1.HTTPStatus.OK).json({
                        status: true,
                        message: "Workflows retrieved successfully",
                        data: userWorkFlowData,
                    });
                }
                catch (error) {
                    if (error instanceof error_1.WorkflowNotFoundError) {
                        return res.status(constants_1.HTTPStatus.NOT_FOUND).json({
                            status: false,
                            message: error.message,
                        });
                    }
                    throw error;
                }
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
            yield middlewares_1.AuthMiddleware.verifyToken(req, res, () => { });
            try {
                const user = req.user;
                const { id } = req.params;
                if (!id) {
                    return res.status(constants_1.HTTPStatus.BAD_REQUEST).json({
                        status: false,
                        message: "Workflow ID is required",
                    });
                }
                let userData;
                try {
                    userData = yield this.userService.fetchUserByClerkId(user.id);
                }
                catch (error) {
                    if (error instanceof error_1.UserNotFoundError) {
                        return res.status(constants_1.HTTPStatus.NOT_FOUND).json({
                            status: false,
                            message: error.message,
                        });
                    }
                    throw error;
                }
                try {
                    const workflowData = yield this.workflowService.fetchWorkFlowById(id, userData.id);
                    if (!workflowData) {
                        return res.status(constants_1.HTTPStatus.NOT_FOUND).json({
                            status: false,
                            message: "Workflow not found",
                        });
                    }
                    if (workflowData.workflow.userId !== userData.id) {
                        return res.status(constants_1.HTTPStatus.CONFLICT).json({
                            status: false,
                            message: "Access denied, You do not have permission to access this workflow",
                        });
                    }
                    return res.status(constants_1.HTTPStatus.OK).json({
                        status: true,
                        message: "Workflow retrieved successfully",
                        data: workflowData,
                    });
                }
                catch (error) {
                    if (error instanceof error_1.WorkflowError) {
                        return res.status(constants_1.HTTPStatus.BAD_REQUEST).json({
                            status: false,
                            message: error.message,
                        });
                    }
                    throw error;
                }
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
    updateWorkflow(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield middlewares_1.AuthMiddleware.verifyToken(req, res, () => { });
            try {
                const body = req.body;
                const parsedData = types_1.WorkflowSchema.safeParse(body);
                if (!parsedData.success) {
                    return res.status(constants_1.HTTPStatus.BAD_REQUEST).json({
                        status: false,
                        message: "Invalid workflow data",
                    });
                }
                const updatedWorkflowData = yield this.workflowService.updateWorkflow(parsedData);
                if (!updatedWorkflowData) {
                    return res.status(constants_1.HTTPStatus.NOT_FOUND).json({
                        status: false,
                        message: "Workflow not found",
                    });
                }
                return res.status(constants_1.HTTPStatus.OK).json({
                    status: true,
                    message: "Workflow updated successfully",
                    data: updatedWorkflowData,
                });
            }
            catch (err) {
                console.error("Error updating workflow:", err);
                if (err.code === "P2025") {
                    return res.status(constants_1.HTTPStatus.NOT_FOUND).json({
                        status: false,
                        message: "Workflow not found",
                    });
                }
                return res.status(constants_1.HTTPStatus.INTERNAL_SERVER_ERROR).json({
                    status: false,
                    message: "Error updating workflow",
                });
            }
        });
    }
    deleteWorkflow(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield middlewares_1.AuthMiddleware.verifyToken(req, res, () => { });
            try {
                const { id } = req.params;
                const existingWorkflow = yield this.prisma.workflow.findUnique({
                    where: { id },
                });
                if (!existingWorkflow) {
                    return res.status(constants_1.HTTPStatus.NOT_FOUND).json({
                        status: false,
                        message: "Workflow not found or already deleted",
                    });
                }
                const deleteWorkflow = yield this.workflowService.deleteWorkflow(id);
                return res.status(constants_1.HTTPStatus.OK).json({
                    status: true,
                    message: "Workflow and associated data deleted successfully",
                    data: deleteWorkflow,
                });
            }
            catch (err) {
                console.error("Error deleting workflow:", err);
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
exports.default = WorkflowController;
__decorate([
    (0, router_1.POST)("/api/v1/workflow"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "createWorkFlowData", null);
__decorate([
    (0, router_1.GET)("/api/v1/workflow"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getWorkFlowData", null);
__decorate([
    (0, router_1.GET)("/api/v1/workflow/:id"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getWorkFlowDataById", null);
__decorate([
    (0, router_1.PUT)("/api/v1/workflow"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "updateWorkflow", null);
__decorate([
    (0, router_1.DELETE)("/api/v1/workflow/:id"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "deleteWorkflow", null);
