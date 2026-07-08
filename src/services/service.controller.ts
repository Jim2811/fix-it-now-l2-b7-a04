import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";
import { serviceService } from "./service.service";

const getAllServices = catchAsync(async (req: Request, res: Response) => {
    const services = await serviceService.getAllServicesFromDB(req.query as any);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Services fetched successfully",
        data: services,
    });
});

export const serviceController = {
    getAllServices,
};