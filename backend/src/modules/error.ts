export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UserNotFoundError extends AppError {
  constructor(identifier: string) {
    super(
      `User not found with identifier: ${identifier}`,
      404,
      "USER_NOT_FOUND"
    );
  }
}

export class WorkflowError extends AppError {
  constructor(message: string, statusCode: number, code: string) {
    super(message, statusCode, code);
  }
}

export class WorkflowCreateError extends WorkflowError {
  constructor(message: string) {
    super(message, 400, "WORKFLOW_CREATE_ERROR");
  }
}

export class WorkflowNotFoundError extends WorkflowError {
  constructor(workflowId?: string) {
    super(
      `Workflow${workflowId ? ` with ID ${workflowId}` : "s"} not found`,
      404,
      "WORKFLOW_NOT_FOUND"
    );
  }
}
