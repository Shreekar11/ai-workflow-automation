"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_repo_1 = __importDefault(require("../../repository/base.repo"));
class ZapController extends base_repo_1.default {
    constructor() {
        super("zap");
    }
}
exports.default = ZapController;
