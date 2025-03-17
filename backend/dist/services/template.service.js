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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
class TemplateService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    createTemplate(user, template) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
}
exports.default = TemplateService;
