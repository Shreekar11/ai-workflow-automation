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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const initializer_1 = __importDefault(require("./initializer"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
class Server {
    constructor() {
        this.port = Number(process.env.PORT) || 8080;
        this.app = (0, express_1.default)();
        this.prisma = new client_1.PrismaClient();
    }
    static get fn() {
        return this.instance;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.$connect();
            console.log("Database connected successfully");
            this.app.use(body_parser_1.default.json());
            this.app.use(body_parser_1.default.urlencoded({
                extended: true,
            }));
            this.app.use((0, cors_1.default)());
            new initializer_1.default().init(this.app);
            this.app.listen(this.port, () => {
                console.log(`Server is running on port ${this.port}`);
            });
        });
    }
}
_a = Server;
Server.instance = new _a();
Server.fn.start();
