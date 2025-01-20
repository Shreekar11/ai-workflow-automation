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
                private_key: (_a = process.env.GOOGLE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        this.sheets = googleapis_1.google.sheets({ version: "v4", auth: this.auth });
    }
    getSheetInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield this.sheets.spreadsheets.get({
                    spreadsheetId: this.sheetId,
                });
                const sheets = response.data.sheets;
                if (!sheets || sheets.length === 0) {
                    throw new Error("No sheets found in the spreadsheet");
                }
                const firstSheet = ((_a = sheets[0].properties) === null || _a === void 0 ? void 0 : _a.title) || "Sheet1";
                if (!this.range.includes("!")) {
                    this.range = `${firstSheet}!${this.range}`;
                }
                else {
                    const sheetName = this.range.split("!")[0];
                    const sheetExists = sheets.some((sheet) => { var _a; return ((_a = sheet.properties) === null || _a === void 0 ? void 0 : _a.title) === sheetName; });
                    if (!sheetExists) {
                        throw new Error(`Sheet "${sheetName}" not found. Available sheets: ${sheets
                            .map((s) => { var _a; return (_a = s.properties) === null || _a === void 0 ? void 0 : _a.title; })
                            .join(", ")}`);
                    }
                }
            }
            catch (error) {
                console.error("Error getting sheet info:", error);
                throw new Error(`Failed to verify sheet: ${error.message}`);
            }
        });
    }
    appendToSheet() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            try {
                yield this.getSheetInfo();
                const formattedValues = Array.isArray(this.values[0])
                    ? this.values
                    : [this.values];
                const response = yield this.sheets.spreadsheets.values.append({
                    spreadsheetId: this.sheetId,
                    range: this.range,
                    valueInputOption: "RAW",
                    requestBody: {
                        values: formattedValues,
                    },
                });
                console.log("Sheet response :- ", response.data);
                return {
                    success: true,
                    updatedRange: (_a = response.data.updates) === null || _a === void 0 ? void 0 : _a.updatedRange,
                    updatedRows: (_b = response.data.updates) === null || _b === void 0 ? void 0 : _b.updatedRows,
                };
            }
            catch (error) {
                console.error("Error: ", {
                    message: error.message,
                    status: (_c = error === null || error === void 0 ? void 0 : error.response) === null || _c === void 0 ? void 0 : _c.status,
                    statusText: (_d = error === null || error === void 0 ? void 0 : error.response) === null || _d === void 0 ? void 0 : _d.statusText,
                    error: (_f = (_e = error === null || error === void 0 ? void 0 : error.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.error,
                });
                if (((_g = error === null || error === void 0 ? void 0 : error.response) === null || _g === void 0 ? void 0 : _g.status) === 403) {
                    throw new Error(`Permission denied. Please ensure ${process.env.GOOGLE_CLIENT_EMAIL} has edit access to the spreadsheet.`);
                }
                if (((_h = error === null || error === void 0 ? void 0 : error.response) === null || _h === void 0 ? void 0 : _h.status) === 400) {
                    throw new Error(`Invalid request. Please verify the sheet name and range format. Current range: ${this.range}`);
                }
                throw error;
            }
        });
    }
}
exports.GoogleSheetsService = GoogleSheetsService;
