import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { technicianService } from "./technician.service";
import { sendResponse } from "../../utils/sendResponse";

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

export const technicianController = {
    updateTechnicainProfile,
    addAvailability
};
