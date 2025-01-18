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
exports.GoogleSheetsService = void 0;
const googleapis_1 = require("googleapis");
class GoogleSheetsService {
    constructor(sheetId, range, values) {
        var _a;
        this.sheetId = sheetId;
        this.range = range;
        this.values = values;
        this.auth = new googleapis_1.google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: (_a = process.env.GOOGLE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        this.sheets = googleapis_1.google.sheets({ version: 'v4', auth: this.auth });
    }
    appendToSheet() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield this.sheets.spreadsheets.values.append({
                    spreadsheetId: this.sheetId,
                    range: this.range,
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [this.values],
                    },
                });
                return {
                    success: true,
                    updatedRange: (_a = response.data.updates) === null || _a === void 0 ? void 0 : _a.updatedRange,
                };
            }
            catch (error) {
                console.error('Error appending to sheet:', error);
                throw new Error('Failed to append to Google Sheet');
            }
        });
    }
}
exports.GoogleSheetsService = GoogleSheetsService;
