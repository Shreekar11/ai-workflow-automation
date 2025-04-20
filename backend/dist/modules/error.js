"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateNotFoundError = exports.TemplateError = exports.WorkflowNotFoundError = exports.WorkflowCreateError = exports.WorkflowError = exports.UserNotFoundError = exports.UserAlreadyExistsError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class UserAlreadyExistsError extends AppError {
    constructor(identifier) {
        super(`User already exists: ${identifier}`, 400, "USER_ALREADY_EXISTS");
    }
}
exports.UserAlreadyExistsError = UserAlreadyExistsError;
class UserNotFoundError extends AppError {
    constructor(identifier) {
        super(`User not found with identifier: ${identifier}`, 404, "USER_NOT_FOUND");
    }
}
exports.UserNotFoundError = UserNotFoundError;
class WorkflowError extends AppError {
    constructor(message, statusCode, code) {
        super(message, statusCode, code);
    }
}
exports.WorkflowError = WorkflowError;
class WorkflowCreateError extends WorkflowError {
    constructor(message) {
        super(message, 400, "WORKFLOW_CREATE_ERROR");
    }
}
exports.WorkflowCreateError = WorkflowCreateError;
class WorkflowNotFoundError extends WorkflowError {
    constructor(workflowId) {
        super(`Workflow${workflowId ? ` with ID ${workflowId}` : "s"} not found`, 404, "WORKFLOW_NOT_FOUND");
    }
}
exports.WorkflowNotFoundError = WorkflowNotFoundError;
class TemplateError extends AppError {
    constructor(message, statusCode, code) {
        super(message, statusCode, code);
    }
}
exports.TemplateError = TemplateError;
class TemplateNotFoundError extends TemplateError {
    constructor(templateId) {
        super(`Template${templateId ? ` with ID ${templateId}` : "s"} not found`, 404, "TEMPLATE_NOT_FOUND");
    }
}
exports.TemplateNotFoundError = TemplateNotFoundError;
