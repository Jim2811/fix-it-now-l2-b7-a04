import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../utils/appError";

export const globalErrorHandler = (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (res.headersSent) {
        return next(error as Error);
    }

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            errorDetails: error.errorDetails,
        });
    }

    const message = error instanceof Error ? error.message : "Something went wrong";

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message,
        errorDetails: message,
    });
};