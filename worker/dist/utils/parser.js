"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parser = void 0;
const parser = (text, values, start = "{", end = "}") => {
    let startIndex = 0;
    let finalString = "";
    while (startIndex < text.length) {
        if (text[startIndex] === start) {
            let endPoint = text.indexOf(end, startIndex);
            if (endPoint === -1) {
                finalString += text[startIndex];
                startIndex++;
                continue;
            }
            let path = text.slice(startIndex + 1, endPoint);
            path = path.replace(/^data\./, "");
            try {
                let value = values[path];
                if (value === undefined || value === null) {
                    throw new Error(`Cannot read property '${path}'`);
                }
                finalString += value.toString();
                startIndex = endPoint + 1;
            }
            catch (error) {
                finalString += text.slice(startIndex, endPoint + 1);
                startIndex = endPoint + 1;
            }
        }
        else {
            finalString += text[startIndex];
            startIndex++;
        }
    }
    return finalString;
};
exports.parser = parser;
