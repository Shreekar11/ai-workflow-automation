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
        const currentAction = templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.template.actions.find((action) => action.sortingOrder === stage);
        const metadata = (templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.metadata) || {};
        try {
            // scraper action
            if ((currentAction === null || currentAction === void 0 ? void 0 : currentAction.type.id) === config_1.availableScraperId) {
                yield processScraperAction(client, currentAction, templateResultData, metadata, stage);
            }
            // llm model action
            if ((currentAction === null || currentAction === void 0 ? void 0 : currentAction.type.id) === config_1.availableModelId) {
                yield processModelAction(client, currentAction, templateResultData, metadata, stage);
            }
            // google docs action
            if ((currentAction === null || currentAction === void 0 ? void 0 : currentAction.type.id) === config_1.availableGoogleDocsId) {
                yield processDocsAction(client, currentAction, templateResultData, metadata, stage);
            }
        }
        catch (error) {
            yield client.templateResult.update({
                where: { id: templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.id },
                data: {
                    status: "failed",
                },
            });
            throw error;
        }
        const lastStage = ((templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.template.actions.length) || 1) - 1;
        if (lastStage !== stage) {
            const nextMessage = JSON.stringify({
                stage: stage + 1,
                templateResultId: templateId,
            });
            console.log("Redis data: ", config_1.QUEUE_NAME, nextMessage);
            const res = yield redisClient.lPush(config_1.QUEUE_NAME, nextMessage);
            console.log(res);
        }
        console.log("Template actions processing completed");
    });
}
function processScraperAction(client, currentAction, templateResultData, metadata, stage) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const templateMetadata = templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.metadata;
        const url = (0, parser_1.parser)((_a = currentAction.metadata) === null || _a === void 0 ? void 0 : _a.url, templateMetadata);
        const scraperService = new scraper_service_1.default(url);
        const actionResult = yield scraperService.scraperAction();
        if (actionResult) {
            yield client.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                yield tx.templateResult.update({
                    where: {
                        id: templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.id,
                    },
                    data: {
                        metadata: Object.assign(Object.assign({}, metadata), { [`${currentAction.type.name.toLowerCase().trim()}_result`]: actionResult }),
                        status: stage === ((templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.template.actions.length) || 1) - 1
                            ? "completed"
                            : "running",
                    },
                });
                // here the metadata of the next step i.e ai-model is updated and scraper_result is added
                yield tx.templateAction.update({
                    where: {
                        actionId: config_1.availableModelId,
                    },
                    data: {
                        metadata: Object.assign(Object.assign({}, metadata), { [`${currentAction.type.name.toLowerCase().trim()}_result`]: actionResult }),
                    },
                });
            }));
        }
    });
}
function processModelAction(client, currentAction, templateResultData, metadata, stage) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const templateMetadata = templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.metadata;
        const scraperResult = (_a = currentAction.metadata) === null || _a === void 0 ? void 0 : _a.scraper_result;
        const url = (0, parser_1.parser)(scraperResult === null || scraperResult === void 0 ? void 0 : scraperResult.url, templateMetadata);
        const title = (0, parser_1.parser)(scraperResult === null || scraperResult === void 0 ? void 0 : scraperResult.title, templateMetadata);
        const content = (0, parser_1.parser)(scraperResult === null || scraperResult === void 0 ? void 0 : scraperResult.content, templateMetadata);
        const system = (0, parser_1.parser)(currentAction.metadata.system, templateMetadata);
        const model = (0, parser_1.parser)(currentAction.metadata.model, templateMetadata);
        const modelService = new model_service_1.default(url, title, content, system, model);
        const actionResult = yield modelService.llmAction();
        if (actionResult) {
            yield client.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                yield tx.templateResult.update({
                    where: {
                        id: templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.id,
                    },
                    data: {
                        metadata: Object.assign(Object.assign({}, metadata), { [`llmmodel_result`]: actionResult }),
                        status: stage === ((templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.template.actions.length) || 1) - 1
                            ? "completed"
                            : "running",
                    },
                });
                // here the metadata of the next step i.e google docs is updated and llm_result is added
                yield tx.templateAction.update({
                    where: {
                        actionId: config_1.availableGoogleDocsId,
                    },
                    data: {
                        metadata: Object.assign(Object.assign({}, metadata), { [`llmmodel_result`]: actionResult, ["scraper_result"]: scraperResult }),
                    },
                });
            }));
        }
    });
}
function processDocsAction(client, currentAction, templateResultData, metadata, stage) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const templateMetadata = templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.metadata;
        const scraperResult = (_a = currentAction === null || currentAction === void 0 ? void 0 : currentAction.metadata) === null || _a === void 0 ? void 0 : _a.scraper_result;
        const url = (0, parser_1.parser)(scraperResult.url, templateMetadata);
        const title = (0, parser_1.parser)(scraperResult.title, templateMetadata);
        const modelResult = (_b = currentAction === null || currentAction === void 0 ? void 0 : currentAction.metadata) === null || _b === void 0 ? void 0 : _b.llmmodel_result;
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
                    metadata: Object.assign(Object.assign({}, metadata), { [`google_docs_result`]: actionResult }),
                    status: stage === ((templateResultData === null || templateResultData === void 0 ? void 0 : templateResultData.template.actions.length) || 1) - 1
                        ? "completed"
                        : "running",
                },
            });
        }
    });
}
