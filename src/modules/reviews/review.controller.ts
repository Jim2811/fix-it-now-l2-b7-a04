import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id as string;
    const review = await reviewService.createReviewIntoDB(customerId, {
        bookingId: req.body.bookingId,
        rating: Number(req.body.rating),
        comment: req.body.comment,
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Review created successfully",
        data: review,
    });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id as string;
    const reviews = await reviewService.getMyReviewsFromDB(customerId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Reviews fetched successfully",
        data: reviews,
    });
});

export const reviewController = {
    createReview,
    getMyReviews,
};