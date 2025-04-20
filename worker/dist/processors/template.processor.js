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
exports.processTemplateMessage = processTemplateMessage;
const parser_1 = require("../utils/parser");
const config_1 = require("../config");
const scraper_service_1 = __importDefault(require("../services/scraper.service"));
const model_service_1 = __importDefault(require("../services/model.service"));
const docs_service_1 = __importDefault(require("../services/docs.service"));
const ACTION_TYPE_CONFIG = {
    scraper: {
        types: ["Blog Scraper", "Linkedin Scraper"],
        processor: processScraperAction,
        resultKey: "scraper_result",
    },
    model: {
        types: ["LLM Model"],
        processor: processModelAction,
        resultKey: "llmmodel_result",
    },
    docs: {
        types: ["Google Docs"],
        processor: processDocsAction,
        resultKey: "google_docs_result",
    },
};
const ACTION_TYPE_MAP = Object.entries(ACTION_TYPE_CONFIG).reduce((map, [key, config]) => {
    config.types.forEach((type) => {
        map[type] = Object.assign(Object.assign({}, config), { category: key });
    });
    return map;
}, {});
function processTemplateMessage(client, redisClient, templateId, stage) {
    return __awaiter(this, void 0, void 0, function* () {
        const templateResultData = yield client.templateResult.findFirst({
            where: {
                id: templateId,
            },
            include: {
                template: {
                    include: {
                        actions: {
                            include: {
                                type: true,
                            },
                        },
                    },
                },
            },
        });
        if (!templateResultData) {
            throw new Error("Template result not found");
        }
        const currentAction = templateResultData.template.actions.find((action) => action.sortingOrder === stage);
        if (!currentAction) {
            throw new Error(`No action found for stage ${stage}`);
        }
        const metadata = (templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.metadata) || {};
        const actionTypeName = currentAction.type.name;
        const actionConfig = ACTION_TYPE_MAP[actionTypeName];
        try {
            if (actionConfig) {
                yield actionConfig.processor(client, currentAction, templateResultData, metadata, stage);
            }
            else {
                console.warn(`No processor found for action type: ${actionTypeName}`);
            }
        }
        catch (error) {
            yield client.templateResult.update({
                where: { id: templateResultData.id },
                data: {
                    status: "FAILED",
                },
            });
            throw error;
        }
        const lastStage = (templateResultData.template.actions.length || 1) - 1;
        if (lastStage !== stage) {
            const nextMessage = JSON.stringify({
                stage: stage + 1,
                templateResultId: templateId,
            });
            yield redisClient.lPush(config_1.QUEUE_NAME, nextMessage);
        }
        console.log("Template action processing completed");
    });
}
// Process scraper actions (Blog Scraper, LinkedIn Scraper, etc.)
function processScraperAction(client, currentAction, templateResultData, metadata, stage) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const templateMetadata = templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.metadata;
        const url = (0, parser_1.parser)((_a = currentAction.metadata) === null || _a === void 0 ? void 0 : _a.url, templateMetadata);
        const scraperService = new scraper_service_1.default(url);
        const actionResult = yield scraperService.scraperAction();
        const actionConfig = ACTION_TYPE_MAP[currentAction.type.name];
        if (!actionResult)
            return;
        const nextActionType = findNextActionType(templateResultData.template.actions, currentAction);
        yield client.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
            // Update template result with new metadata
            yield tx.templateResult.update({
                where: {
                    id: templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.id,
                },
                data: {
                    metadata: Object.assign(Object.assign({}, metadata), { [actionConfig.resultKey]: actionResult }),
                    status: isLastStage(templateResultData, stage)
                        ? "COMPLETED"
                        : "RUNNING",
                },
            });
            if (nextActionType) {
                yield tx.templateAction.update({
                    where: {
                        actionId: nextActionType.actionId,
                    },
                    data: {
                        metadata: Object.assign(Object.assign({}, metadata), { [actionConfig.resultKey]: actionResult }),
                    },
                });
            }
        }));
    });
}
// Process model actions (AI Model, LinkedIn Model, etc.)
function processModelAction(client, currentAction, templateResultData, metadata, stage) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const templateMetadata = templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.metadata;
        const scraperResult = (_a = currentAction.metadata) === null || _a === void 0 ? void 0 : _a.scraper_result;
        if (!scraperResult) {
            throw new Error("Missing scraper result in model action metadata");
        }
        const url = (0, parser_1.parser)(scraperResult === null || scraperResult === void 0 ? void 0 : scraperResult.url, templateMetadata);
        const title = (0, parser_1.parser)(scraperResult === null || scraperResult === void 0 ? void 0 : scraperResult.title, templateMetadata);
        const content = (0, parser_1.parser)(scraperResult === null || scraperResult === void 0 ? void 0 : scraperResult.content, templateMetadata);
        const system = (0, parser_1.parser)(currentAction.metadata.system, templateMetadata);
        const model = (0, parser_1.parser)(currentAction.metadata.model, templateMetadata);
        const modelService = new model_service_1.default(url, title, content, system, model);
        const actionResult = yield modelService.llmAction();
        const actionConfig = ACTION_TYPE_MAP[currentAction.type.name];
        if (!actionResult)
            return;
        const nextActionType = findNextActionType(templateResultData.template.actions, currentAction);
        yield client.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
            yield tx.templateResult.update({
                where: {
                    id: templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.id,
                },
                data: {
                    metadata: Object.assign(Object.assign({}, metadata), { [actionConfig.resultKey]: actionResult }),
                    status: isLastStage(templateResultData, stage)
                        ? "COMPLETED"
                        : "RUNNING",
                },
            });
            // If there's a next action, update its metadata
            if (nextActionType) {
                yield tx.templateAction.update({
                    where: {
                        actionId: nextActionType.actionId,
                    },
                    data: {
                        metadata: Object.assign(Object.assign({}, metadata), { [actionConfig.resultKey]: actionResult, scraper_result: scraperResult }),
                    },
                });
            }
        }));
    });
}
// Process Google Docs actions
function processDocsAction(client, currentAction, templateResultData, metadata, stage) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const templateMetadata = templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.metadata;
        const scraperResult = (_a = currentAction === null || currentAction === void 0 ? void 0 : currentAction.metadata) === null || _a === void 0 ? void 0 : _a.scraper_result;
        if (!scraperResult) {
            throw new Error("Missing scraper result in docs action metadata");
        }
        const url = (0, parser_1.parser)(scraperResult.url, templateMetadata);
        const title = (0, parser_1.parser)(scraperResult.title, templateMetadata);
        const modelResult = (_b = currentAction === null || currentAction === void 0 ? void 0 : currentAction.metadata) === null || _b === void 0 ? void 0 : _b.llmmodel_result;
        if (!modelResult) {
            throw new Error("Missing model result in docs action metadata");
        }
        const result = (0, parser_1.parser)(modelResult.result, templateMetadata);
        const model = (0, parser_1.parser)(modelResult.model, templateMetadata);
        const googleDocsId = (0, parser_1.parser)((_c = currentAction === null || currentAction === void 0 ? void 0 : currentAction.metadata) === null || _c === void 0 ? void 0 : _c.googleDocsId, templateMetadata);
        const docsService = new docs_service_1.default(url, title, result, model, googleDocsId);
        const actionResult = yield docsService.googleDocsAction();
        if (actionResult) {
            yield client.templateResult.update({
                where: {
                    id: templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.id,
                },
                data: {
                    metadata: Object.assign(Object.assign({}, metadata), { google_docs_result: actionResult }),
                    status: isLastStage(templateResultData, stage)
                        ? "COMPLETED"
                        : "RUNNING",
                },
            });
        }
    });
}
function isLastStage(templateResultData, stage) {
    return stage === ((templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.template.actions.length) || 1) - 1;
}
function findNextActionType(actions, currentAction) {
    const sortedActions = [...actions].sort((a, b) => a.sortingOrder - b.sortingOrder);
    const currentIndex = sortedActions.findIndex((action) => action.id === currentAction.id);
    if (currentIndex === -1 || currentIndex === sortedActions.length - 1) {
        return null;
    }
    return sortedActions[currentIndex + 1];
}
