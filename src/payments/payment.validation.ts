import { NextFunction, Request, Response } from "express";

const validateCreatePayment = (req: Request, res: Response, next: NextFunction) => {
    const { bookingId } = req.body;

    if (!bookingId || typeof bookingId !== "string") {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errorDetails: "bookingId is required and must be a string",
        });
    }

    next();
};

const validateConfirmPayment = (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.body;

    if (!sessionId || typeof sessionId !== "string") {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errorDetails: "sessionId is required and must be a string",
        });
    }

    next();
};

export const paymentValidation = {
    validateCreatePayment,
    validateConfirmPayment,
};