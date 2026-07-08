import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { techniciansService } from "./technicians.service";
import { sendResponse } from "../utils/sendResponse";

const getMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id as string;
    const result = await techniciansService.getTechnicianProfileFromDB(userId);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Technician profile fetched successfully",
        data: result
    });
});

export const techniciansController = {
    getMyProfile
};
