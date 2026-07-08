import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { bookingService } from "./booking.service";

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
    const bookings = await bookingService.getAllBookingsFromDB();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Bookings fetched successfully",
        data: bookings,
    });
});

export const bookingController = {
    getAllBookings,
};