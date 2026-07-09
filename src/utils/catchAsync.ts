import { NextFunction, Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "./appError";

export const catchAsync = (fn: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            console.log(error);

            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    errorDetails: error.errorDetails,
                });
            }

            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: (error as Error).message || "Something went wrong",
                errorDetails: (error as Error).message || "Something went wrong",
            })
        }
    }
}
