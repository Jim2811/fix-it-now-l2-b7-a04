import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { technicianService } from "./technician.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const updateTechnicainProfile = catchAsync(async (req: Request, res: Response) => {
    const technicianId = req.user?.id;
    const updatedProfile = await technicianService.updateTechnicianProfileIntoDB(technicianId as string, req.body);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Technician profile updated successfully",
        data: updatedProfile
    });
});

const addAvailability = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const result = await technicianService.addAvailabilityIntoDB(userId as string, req.body);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Availability slot upserted successfully",
        data: result
    });
});

const getTechnicianBookings = catchAsync(async (req: Request, res: Response) => {
    const technicianId = req.user?.id as string;
    const bookings = await technicianService.getTechnicianBookingsFromDB(technicianId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Technician bookings fetched successfully",
        data: bookings,
    });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
    const technicianId = req.user?.id as string;
    const bookingId = req.params.id;
    const updatedBooking = await technicianService.updateBookingStatusIntoDB(technicianId, bookingId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Booking status updated successfully",
        data: updatedBooking,
    });
});

export const technicianController = {
    updateTechnicainProfile,
    addAvailability
    ,getTechnicianBookings,
    updateBookingStatus,
};
