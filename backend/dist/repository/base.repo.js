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
const client_1 = require("@prisma/client");
class Repository {
    constructor(modelName) {
        this.prisma = new client_1.PrismaClient();
        this.modelName = modelName;
    }
    get model() {
        return this.prisma[this.modelName];
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const getData = yield this.model.findUnique({
                where: {
                    id,
                },
            });
            return getData;
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const createData = yield this.model.create({
                data,
            });
            return createData;
        });
    }
    patch(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateData = yield this.model.update({
                where: {
                    id,
                },
                data,
            });
            return updateData;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleteData = yield this.model.delete({
                where: {
                    id,
                },
            });
            return deleteData;
        });
    }
}
exports.default = Repository;
