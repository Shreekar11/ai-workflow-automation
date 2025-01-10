"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class Initializer {
    constructor() { }
    initExpressRoute(controller, app) {
        if (controller.__routes) {
            for (const route of controller.__routes) {
                app[route.method](route.path, (req, res, next) => {
                    route.handler.call(controller, req, res, next);
                });
            }
        }
    }
    getAllTsFiles(dirPath) {
        let files = [];
        const fileDirs = fs_1.default.readdirSync(dirPath);
        for (const fileDir of fileDirs) {
            const fullPath = path_1.default.join(dirPath, fileDir);
            if (fs_1.default.statSync(fullPath).isDirectory()) {
                files = files.concat(this.getAllTsFiles(fullPath));
            }
            else {
                if (fullPath.endsWith(".ts") || fullPath.endsWith(".js")) {
                    files.push(fullPath);
                }
            }
        }
        return files;
    }
    getAllControllers() {
        const controllers = [];
        const controllerPath = path_1.default.resolve(__dirname, "controllers");
        const files = this.getAllTsFiles(controllerPath);
        for (const file of files) {
            const controller = require(file).default;
            controllers.push(controller);
        }
        return controllers;
    }
    init(app) {
        const controllers = this.getAllControllers();
        for (const controller of controllers) {
            try {
                const instance = new controller();
                this.initExpressRoute(instance, app);
            }
            catch (err) {
                console.log("Error: ", err);
            }
        }
    }
}
exports.default = Initializer;
