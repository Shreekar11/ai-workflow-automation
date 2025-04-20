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
exports.AuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../constants");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
class AuthMiddleware {
    constructor() { }
    static verifyToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    return res.status(constants_1.HTTPStatus.UNAUTHORIZED).json({
                        status: false,
                        message: "Unauthorized",
                        error: "Unauthorized",
                    });
                }
                const token = authHeader.split(" ")[1];
                const decodedToken = jsonwebtoken_1.default.decode(token);
                if (!decodedToken || !decodedToken.sub) {
                    return res.status(constants_1.HTTPStatus.UNAUTHORIZED).json({
                        status: false,
                        message: "Unauthorized",
                        error: "Unauthorized",
                    });
                }
                const clerkUserId = decodedToken.sub;
                const user = yield clerk_sdk_node_1.clerkClient.users.getUser(clerkUserId);
                if (!user) {
                    return res.status(constants_1.HTTPStatus.UNAUTHORIZED).json({
                        status: false,
                        message: "Unauthorized: Missing user ID",
                    });
                }
                req.user = user;
                next();
            }
            catch (error) {
                console.error("Error in token verification:", error);
                return res.status(constants_1.HTTPStatus.INTERNAL_SERVER_ERROR).json({
                    status: false,
                    message: "Internal server error during token verification",
                });
            }
        });
    }
}
exports.AuthMiddleware = AuthMiddleware;
