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
const client_1 = require("@prisma/client");
const router_1 = require("../decorators/router");
const middlewares_1 = require("../middlewares");
const constants_1 = require("../constants");
const error_1 = require("../modules/error");
const user_service_1 = require("../services/user.service");
class RunController {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.userService = new user_service_1.UserService();
    }
    getFlowRuns(req, res) {
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
                const result = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const workflows = yield tx.workflow.findMany({
                        where: {
                            userId: userData.id,
                        },
                        include: {
                            workflowRuns: true,
                        },
                    });
                    const templates = yield tx.template.findMany({
                        where: {
                            userId: userData.id,
                        },
                        include: {
                            templateResults: true,
                        },
                    });
                    return {
                        workflows,
                        templates,
                    };
                }));
                return res.status(constants_1.HTTPStatus.OK).json({
                    status: true,
                    message: "Runs retrieved successfully!",
                    data: result,
                });
            }
            catch (error) {
                console.error("Error fetching runs:", error);
                return res.status(constants_1.HTTPStatus.INTERNAL_SERVER_ERROR).json({
                    status: false,
                    message: "Failed to fetch runs. Please try again later.",
                    error: process.env.NODE_ENV === "development" ? error.message : undefined,
                });
            }
        });
    }
}
exports.default = RunController;
__decorate([
    (0, router_1.GET)("/api/v1/run"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RunController.prototype, "getFlowRuns", null);
