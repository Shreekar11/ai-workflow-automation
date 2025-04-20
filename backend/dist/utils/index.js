"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomString = void 0;
const generateRandomString = (length = 20) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charLength = characters.length;
    let randomString = "sk_";
    for (let i = 0; i < length; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * charLength));
    }
    return randomString;
};
exports.generateRandomString = generateRandomString;
