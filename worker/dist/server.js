"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const http_1 = __importDefault(require("http"));
class Server {
    constructor(port = 8000) {
        this.port = port;
        this.server = http_1.default.createServer(this.requestHandler.bind(this));
    }
    requestHandler(req, res) {
        if (req.url === "/" && req.method === "GET") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Worker is running" }));
        }
        else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Not Found" }));
        }
    }
    start() {
        this.server.listen(this.port, () => {
            console.log(`Worker HTTP server listening on port ${this.port}`);
        });
    }
    shutdown() {
        return new Promise((resolve) => {
            this.server.close(() => {
                console.log("HTTP server closed");
                resolve();
            });
        });
    }
}
exports.Server = Server;
