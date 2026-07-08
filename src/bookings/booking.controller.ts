import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";
import { bookingService } from "./booking.service";

const createBooking = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id as string;
    const booking = await bookingService.createBookingIntoDB(customerId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Booking created successfully",
        data: booking,
    });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id as string;
    const bookings = await bookingService.getMyBookingsFromDB(customerId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Bookings fetched successfully",
        data: bookings,
    });
});

export const bookingController = {
    createBooking,
    getMyBookings,
};