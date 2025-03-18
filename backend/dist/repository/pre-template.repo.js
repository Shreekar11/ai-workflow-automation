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
const base_repo_1 = __importDefault(require("./base.repo"));
class PreTemplateRepository extends base_repo_1.default {
    constructor() {
        super("preTemplate");
    }
    getPreTemplatById(templateId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const preTemplate = yield this.model.findUnique({
                    where: { id: templateId },
                    include: {
                        template: true,
                        availableTemplateActions: {
                            include: {
                                actions: {
                                    include: {
                                        type: true,
                                    },
                                    orderBy: {
                                        sortingOrder: "asc",
                                    },
                                },
                            },
                        },
                    },
                });
                if (!preTemplate) {
                    throw new Error("PreTemplate not found");
                }
                return preTemplate;
            }
            catch (error) {
                console.error("Error fetching PreTemplate:", error);
                throw new Error("Failed to fetch PreTemplate");
            }
        });
    }
    getAllPreTemplates() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const preTemplates = yield this.model.findMany({
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        availableTemplateActions: {
                            select: {
                                name: true,
                                image: true,
                            },
                        },
                    },
                });
                return preTemplates;
            }
            catch (error) {
                console.error("Error fetching PreTemplates:", error);
                throw new Error("Failed to fetch PreTemplates");
            }
        });
    }
}
exports.default = PreTemplateRepository;
