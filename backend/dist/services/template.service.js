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
const error_1 = require("../modules/error");
const client_1 = require("@prisma/client");
const templates_repo_1 = __importDefault(require("../repository/templates.repo"));
class TemplateService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.templateRepo = new templates_repo_1.default();
    }
    createTemplate(user, template) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const templateData = yield tx.template.create({
                        data: {
                            userId: user.id,
                            preTemplateId: template.data.preTemplateId || "",
                            name: template.data.name,
                            actions: {
                                create: template.data.actions.map((item, index) => ({
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
                    return templateData;
                }));
                return data;
            }
            catch (error) {
                if (error instanceof error_1.TemplateError) {
                    throw error;
                }
                console.error("Error fetching workflows:", error);
                throw new error_1.AppError("Failed to fetch workflows", 500, "WORKFLOW_FETCH_ERROR");
            }
        });
    }
    fetchAllWorkflows(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const templates = yield this.templateRepo.getAllUserTemplates(user.id);
                if (!templates || templates.length === 0) {
                    throw new error_1.TemplateNotFoundError();
                }
                return templates;
            }
            catch (error) {
                if (error instanceof error_1.TemplateError) {
                    throw error;
                }
                console.error("Error fetching workflows:", error);
                throw new error_1.AppError("Failed to fetch workflows", 500, "WORKFLOW_FETCH_ERROR");
            }
        });
    }
}
exports.default = TemplateService;
