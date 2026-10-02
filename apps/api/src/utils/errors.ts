export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(fields: Record<string, string>, message = 'The request could not be processed.') {
    super(400, 'VALIDATION_ERROR', message, fields);
  }
}

export class AuthRequiredError extends AppError {
  constructor() {
    super(401, 'AUTH_REQUIRED', 'Authentication required.');
  }
}

export class AuthInvalidError extends AppError {
  constructor() {
    super(401, 'AUTH_INVALID', 'Invalid credentials.');
  }
}

export class ForbiddenError extends AppError {
  constructor() {
    super(403, 'FORBIDDEN', 'You do not have permission to perform this action.');
  }
}

export class NotFoundError extends AppError {
  constructor() {
    super(404, 'NOT_FOUND', 'Resource not found.');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists.') {
    super(409, 'CONFLICT', message);
  }
}
