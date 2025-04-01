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
const router_1 = require("../decorators/router");
const middlewares_1 = require("../middlewares");
const constants_1 = require("../constants");
const types_1 = require("../types");
const user_service_1 = require("../services/user.service");
const error_1 = require("../modules/error");
const template_service_1 = __importDefault(require("../services/template.service"));
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const QUEUE_NAME = "workflow-events";
class TemplateController {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.userService = new user_service_1.UserService();
        this.templateService = new template_service_1.default();
    }
    createTemplate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield middlewares_1.AuthMiddleware.verifyToken(req, res, () => { });
            try {
                const user = req.user;
                const { body } = req;
                const parsedData = types_1.TemplateSchema.safeParse(body);
                if (!parsedData.success) {
                    return res.status(constants_1.HTTPStatus.BAD_REQUEST).json({
                        status: false,
                        message: "Invalid template data",
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
                const template = yield this.templateService.createTemplate(userData, parsedData);
                return res.status(constants_1.HTTPStatus.CREATED).json({
                    status: true,
                    message: "Template saved successfully!",
                    data: template,
                });
            }
            catch (err) {
                console.error("Error creating template:", err);
                return res.status(constants_1.HTTPStatus.INTERNAL_SERVER_ERROR).json({
                    status: false,
                    message: "Failed to create template",
                });
            }
        });
    }
    getAllUserTemplates(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield middlewares_1.AuthMiddleware.verifyToken(req, res, () => { });
            const user = req.user;
            try {
                const userData = yield this.userService.fetchUserByClerkId(user.id);
                const templates = yield this.templateService.fetchAllTemplates(userData);
                return res.status(constants_1.HTTPStatus.OK).json({
                    status: true,
                    message: "Templates retrieved successfully!",
                    data: templates,
                });
            }
            catch (err) {
                console.log("Error: ", err);
                return res.status(constants_1.HTTPStatus.INTERNAL_SERVER_ERROR).json({
                    status: false,
                    message: "Failed to fetch templates",
                });
            }
        });
    }
    templateRunFunction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield middlewares_1.AuthMiddleware.verifyToken(req, res, () => { });
            const { body } = req;
            const { id } = req.params;
            if (!id) {
                return res.status(constants_1.HTTPStatus.BAD_REQUEST).json({
                    status: false,
                    message: "Template ID is required",
                });
            }
            const redisClient = (0, redis_1.createClient)({
                url: process.env.REDIS_URL || "redis://localhost:6379",
            });
            redisClient.on("error", (err) => console.error("Redis Client Error:", err));
            try {
                yield redisClient.connect();
                const templateResult = yield this.prisma.templateResult.create({
                    data: {
                        templateId: id,
                        metadata: body.metadata,
                        status: "running",
                    },
                });
                const message = JSON.stringify({
                    templateResultId: templateResult.id,
                    stage: 0,
                });
                const pipeline = redisClient.multi();
                pipeline.lPush(QUEUE_NAME, message);
                yield pipeline.exec();
                console.log("Message pushed to Redis queue successfully");
                return res.status(constants_1.HTTPStatus.OK).json({
                    status: true,
                    message: "Template processed successfully",
                    workflowId: id,
                });
            }
            catch (err) {
                console.error("Error processing template:", err);
                return res.status(constants_1.HTTPStatus.INTERNAL_SERVER_ERROR).json({
                    status: false,
                    message: "Failed to process template",
                });
            }
            finally {
                yield redisClient.disconnect();
            }
        });
    }
}
exports.default = TemplateController;
__decorate([
    (0, router_1.POST)("/api/v1/template"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "createTemplate", null);
__decorate([
    (0, router_1.GET)("/api/v1/template"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "getAllUserTemplates", null);
__decorate([
    (0, router_1.POST)("/api/v1/template/:id"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "templateRunFunction", null);
