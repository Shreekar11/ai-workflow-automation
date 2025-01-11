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
class WorkFlowController {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    create1WorkFlowData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const clerkUserId = req.headers["clerk-user-id"];
            if (!clerkUserId) {
                return res.status(401).json({
                    status: false,
                    message: "Unauthorized",
                });
            }
            const userData = yield new user_repo_1.default().getUserByClerkUserId((clerkUserId === null || clerkUserId === void 0 ? void 0 : clerkUserId.toString()) || "");
            if (!userData) {
                return res.status(404).json({
                    status: false,
                    message: "User not found",
                });
            }
            const parsedData = types_1.WorkFlowSchema.safeParse(body);
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ status: false, message: "Incorrect Workflow data" });
            }
            const workflow = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const workflow = yield tx.workflow.create({
                    data: {
                        userId: userData.id,
                        triggerId: "",
                        actions: {
                            create: parsedData.data.actions.map((item, index) => ({
                                actionId: item.availableActionId,
                                sortingOrder: index,
                            })),
                        },
                    },
                });
                const trigger = yield tx.trigger.create({
                    data: {
                        triggerId: parsedData.data.availableTriggetId,
                        workflowId: workflow.id,
                    },
                });
                yield tx.workflow.update({
                    where: {
                        id: workflow.id,
                    },
                    data: {
                        triggerId: trigger.id,
                    },
                });
                return workflow;
            }));
            return res.status(201).json({
                status: true,
                message: "Workflow created successfully",
                data: workflow,
            });
        });
    }
    getWorkFlowData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const clerkUserId = req.headers["clerk-user-id"];
            if (!clerkUserId) {
                return res.status(401).json({ status: false, message: "Unauthorized" });
            }
            const userData = yield new user_repo_1.default().getUserByClerkUserId((clerkUserId === null || clerkUserId === void 0 ? void 0 : clerkUserId.toString()) || "");
            if (!userData) {
                return res.status(404).json({ status: false, message: "User not found" });
            }
            const userId = userData.id;
            const userWorkFlowData = yield new workflow_repo_1.default().getAllUsersWorkFlow(userId);
            return res.status(200).json({
                status: true,
                message: "User WorkFlows retrieved",
                data: userWorkFlowData,
            });
        });
    }
    getWorkFlowDataById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const clerkUserId = req.headers["clerk-user-id"];
            if (!clerkUserId) {
                return res.status(401).json({ status: false, message: "Unauthorized" });
            }
            const userData = yield new user_repo_1.default().getUserByClerkUserId((clerkUserId === null || clerkUserId === void 0 ? void 0 : clerkUserId.toString()) || "");
            const userId = userData === null || userData === void 0 ? void 0 : userData.id;
            const workFlowData = yield new workflow_repo_1.default().getWorkFlowById(id, userId);
            return res.status(200).json({
                status: true,
                message: "WorkFlow data retrieved successfully",
                data: workFlowData,
            });
        });
    }
}
exports.default = WorkFlowController;
__decorate([
    (0, router_1.POST)("/api/v1/workflow"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkFlowController.prototype, "create1WorkFlowData", null);
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
