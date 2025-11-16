export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
    }
}

export class DatabaseError extends AppError {
    constructor(message = 'Database error', originalError = null) {
        super(message, 500);
        this.originalError = originalError;
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 400);
    }
}
