import { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/appError";

const validateCreateReview = (req: Request, res: Response, next: NextFunction) => {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || typeof bookingId !== "string") {
        return next(new AppError(400, "Validation error", "bookingId is required and must be a string"));
    }

    if (rating === undefined || Number.isNaN(Number(rating))) {
        return next(new AppError(400, "Validation error", "rating is required and must be a number"));
    }

    const ratingNumber = Number(rating);

    if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
        return next(new AppError(400, "Validation error", "rating must be an integer between 1 and 5"));
    }

    if (comment !== undefined && typeof comment !== "string") {
        return next(new AppError(400, "Validation error", "comment must be a string if provided"));
    }

    next();
};

export const reviewValidation = {
    validateCreateReview,
};