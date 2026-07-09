import { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/appError";

const validateCreatePayment = (req: Request, res: Response, next: NextFunction) => {
    const { bookingId } = req.body;

    if (!bookingId || typeof bookingId !== "string") {
        return next(new AppError(400, "Validation error", "bookingId is required and must be a string"));
    }

    next();
};

const validateConfirmPayment = (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.body;

    if (!sessionId || typeof sessionId !== "string") {
        return next(new AppError(400, "Validation error", "sessionId is required and must be a string"));
    }

    next();
};

export const paymentValidation = {
    validateCreatePayment,
    validateConfirmPayment,
};