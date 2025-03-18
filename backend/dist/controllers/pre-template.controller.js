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
const client_1 = require("@prisma/client");
const pre_template_repo_1 = __importDefault(require("../repository/pre-template.repo"));
const router_1 = require("../decorators/router");
const middlewares_1 = require("../middlewares");
const user_service_1 = require("../services/user.service");
const constants_1 = require("../constants");
class PreTemplateController {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.preTemplateRepo = new pre_template_repo_1.default();
        this.userService = new user_service_1.UserService();
    }
    getPreTemplate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield middlewares_1.AuthMiddleware.verifyToken(req, res, () => { });
            const { templateId } = req.body;
            try {
                const preTemplateData = yield this.preTemplateRepo.getPreTemplatById(templateId);
                return res.status(constants_1.HTTPStatus.OK).json({
                    status: true,
                    message: "Pre-Template retrieved successfully!",
                    data: preTemplateData,
                });
            }
            catch (error) {
                console.error("Error retrieving Pre-Template:", error);
                return res.status(constants_1.HTTPStatus.INTERNAL_SERVER_ERROR).json({
                    status: false,
                    message: "Failed to retrieve Pre-Template",
                });
            }
        });
    }
    getAllPreTemplates(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield middlewares_1.AuthMiddleware.verifyToken(req, res, () => { });
            try {
                const preTemplates = yield this.preTemplateRepo.getAllPreTemplates();
                return res.status(constants_1.HTTPStatus.OK).json({
                    status: true,
                    message: "Pre-Templates retrieved successfully!",
                    data: preTemplates,
                });
            }
            catch (error) {
                console.error("Error retrieving Pre-Template:", error);
                return res.status(constants_1.HTTPStatus.INTERNAL_SERVER_ERROR).json({
                    status: false,
                    message: "Failed to retrieve Pre-Template",
                });
            }
        });
    }
}
exports.default = PreTemplateController;
__decorate([
    (0, router_1.GET)("/api/v1/pre/template"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PreTemplateController.prototype, "getPreTemplate", null);
__decorate([
    (0, router_1.GET)("/api/v1/pre/template/all"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PreTemplateController.prototype, "getAllPreTemplates", null);
