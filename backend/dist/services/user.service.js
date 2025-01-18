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
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const user_repo_1 = __importDefault(require("../repository/user.repo"));
const error_1 = require("../modules/error");
class UserService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.userRepo = new user_repo_1.default();
    }
    createUser(parsedData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userExists = yield this.userRepo.getUserByEmail(parsedData.data.email);
                if (userExists) {
                    throw new error_1.UserAlreadyExistsError(parsedData.data.clerkUserId);
                }
                const userData = {
                    clerkUserId: parsedData.data.clerkUserId,
                    firstName: parsedData.data.firstName,
                    lastName: parsedData.data.lastName,
                    email: parsedData.data.email.toLowerCase().trim(),
                };
                const createUserData = yield this.userRepo.create(userData);
                return createUserData;
            }
            catch (error) {
                if (error instanceof error_1.UserAlreadyExistsError) {
                    throw error;
                }
                throw new error_1.AppError("Failed to fetch user data", 500, "USER_FETCH_ERROR");
            }
        });
    }
    fetchUserByClerkId(clerkUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userData = yield this.userRepo.getUserByClerkUserId(clerkUserId);
                if (!userData) {
                    throw new error_1.UserNotFoundError(clerkUserId);
                }
                return userData;
            }
            catch (error) {
                if (error instanceof error_1.UserNotFoundError) {
                    throw error;
                }
                throw new error_1.AppError("Failed to fetch user data", 500, "USER_FETCH_ERROR");
            }
        });
    }
}
exports.UserService = UserService;
