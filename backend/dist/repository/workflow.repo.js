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
class WorkFlowRepo extends base_repo_1.default {
    constructor() {
        super("workflow");
    }
    getWorkFlowById(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const workFlowData = yield this.model.findFirst({
                where: {
                    id,
                    userId,
                },
                include: {
                    actions: {
                        include: {
                            type: true,
                        },
                    },
                    trigger: {
                        include: {
                            type: true,
                        },
                    },
                },
            });
            return workFlowData;
        });
    }
    getAllUsersWorkFlow(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const workFlowData = yield this.model.findMany({
                where: {
                    userId,
                },
                include: {
                    actions: {
                        include: {
                            type: true,
                        },
                    },
                    trigger: {
                        include: {
                            type: true,
                        },
                    },
                },
            });
            return workFlowData;
        });
    }
    updateWorkflowData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateWorkflow = yield this.model.update({
                where: {
                    id: data.data.id || "",
                },
                data: {
                    name: data.data.name,
                    actions: {
                        deleteMany: {}, // deleting existing actions then adding/creating new actions
                        create: data.data.actions.map((action) => ({
                            availableActionId: action.availableActionId,
                            metadata: action.actionMetadata,
                            type: {
                                connect: {
                                    id: action.availableActionId,
                                },
                            },
                        })),
                    },
                },
                include: {
                    actions: true,
                    trigger: {
                        include: {
                            type: true,
                        },
                    },
                },
            });
            return updateWorkflow;
        });
    }
}
exports.default = WorkFlowRepo;
