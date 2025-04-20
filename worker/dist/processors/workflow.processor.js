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
exports.processWorkflowMessage = processWorkflowMessage;
const parser_1 = require("../utils/parser");
const config_1 = require("../config");
const mail_service_1 = require("../services/mail.service");
const sheets_service_1 = require("../services/sheets.service");
function processWorkflowMessage(client, redisClient, workflowRunId, stage) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g;
        const workflowRunDetails = yield client.workflowRun.findFirst({
            where: {
                id: workflowRunId,
            },
            include: {
                workflow: {
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
        const currentAction = workflowRunDetails === null || workflowRunDetails === void 0 ? void 0 : workflowRunDetails.workflow.actions.find((action) => action.sortingOrder === stage);
        if (!currentAction) {
            console.log("Current action not found");
            return;
        }
        try {
            // email action
            if (currentAction.type.id === config_1.availableEmailId) {
                const workflowRunMetadata = workflowRunDetails === null || workflowRunDetails === void 0 ? void 0 : workflowRunDetails.metadata;
                const to = (0, parser_1.parser)((_a = currentAction.metadata) === null || _a === void 0 ? void 0 : _a.to, workflowRunMetadata);
                const from = (0, parser_1.parser)((_b = currentAction.metadata) === null || _b === void 0 ? void 0 : _b.from, workflowRunMetadata);
                const subject = (0, parser_1.parser)((_c = currentAction.metadata) === null || _c === void 0 ? void 0 : _c.subject, workflowRunMetadata);
                const body = (0, parser_1.parser)((_d = currentAction.metadata) === null || _d === void 0 ? void 0 : _d.body, workflowRunMetadata);
                const emailService = new mail_service_1.EmailService(to, from, subject, body);
                yield emailService.sendEmailFunction();
                console.log(`Sending out Email to ${to}, body is ${body}`);
                yield client.workflowRun.update({
                    where: { id: workflowRunDetails === null || workflowRunDetails === void 0 ? void 0 : workflowRunDetails.id },
                    data: { status: "COMPLETED" },
                });
            }
            // google sheets action
            if (currentAction.type.id === config_1.availableGoogleSheetsId) {
                const workflowRunMetadata = workflowRunDetails === null || workflowRunDetails === void 0 ? void 0 : workflowRunDetails.metadata;
                const sheetId = (0, parser_1.parser)((_e = currentAction.metadata) === null || _e === void 0 ? void 0 : _e.sheetId, workflowRunMetadata);
                let range = (0, parser_1.parser)((_f = currentAction.metadata) === null || _f === void 0 ? void 0 : _f.range, workflowRunMetadata);
                if (range.startsWith("Sheet!")) {
                    range = range.replace("Sheet!", "Sheet1!");
                }
                else {
                    range = `Sheet1!${range}`;
                }
                const valuesStr = (0, parser_1.parser)((_g = currentAction.metadata) === null || _g === void 0 ? void 0 : _g.values, workflowRunMetadata);
                const values = valuesStr.split(",");
                const sheetsService = new sheets_service_1.GoogleSheetsService(sheetId, range, values);
                yield sheetsService.appendToSheet();
                console.log(`Added row to Google Sheet ${sheetId} in range ${range}`);
                yield client.workflowRun.update({
                    where: { id: workflowRunDetails === null || workflowRunDetails === void 0 ? void 0 : workflowRunDetails.id },
                    data: { status: "COMPLETED" },
                });
            }
        }
        catch (error) {
            yield client.workflowRun.update({
                where: { id: workflowRunDetails === null || workflowRunDetails === void 0 ? void 0 : workflowRunDetails.id },
                data: {
                    status: "failed",
                },
            });
            throw error;
        }
        const lastStage = ((workflowRunDetails === null || workflowRunDetails === void 0 ? void 0 : workflowRunDetails.workflow.actions.length) || 1) - 1;
        if (lastStage !== stage) {
            const nextMessage = JSON.stringify({
                stage: stage + 1,
                workflowRunId,
            });
            yield redisClient.lPush(config_1.QUEUE_NAME, nextMessage);
        }
    });
}
