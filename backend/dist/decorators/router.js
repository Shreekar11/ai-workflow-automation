"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.PUT = exports.POST = exports.GET = void 0;
function registerRoute(method, path) {
    return (target, propertyKey, descriptor) => {
        if (!target.__routes) {
            target.__routes = [];
        }
        target.__routes.push({ method, path, handler: (descriptor === null || descriptor === void 0 ? void 0 : descriptor.value) || "" });
        return descriptor;
    };
}
const GET = (path) => {
    return registerRoute("get", path);
};
exports.GET = GET;
const POST = (path) => {
    return registerRoute("post", path);
};
exports.POST = POST;
const PUT = (path) => {
    return registerRoute("put", path);
};
exports.PUT = PUT;
const DELETE = (path) => {
    return registerRoute("delete", path);
};
exports.DELETE = DELETE;
