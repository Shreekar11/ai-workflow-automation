"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Initializer = void 0;
class Initializer {
    init(app) {
        app.get("/", (req, res) => {
            res.json({ message: "Server is running" }).status(200);
        });
    }
}
exports.Initializer = Initializer;
