export class AppError extends Error {
    statusCode: number;
    errorDetails: string | string[] | Record<string, unknown>;

    constructor(
        statusCode: number,
        message: string,
        errorDetails: string | string[] | Record<string, unknown> = message
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errorDetails = errorDetails;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}