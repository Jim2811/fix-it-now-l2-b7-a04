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

const createService = catchAsync(async (req: Request, res: Response) => {
    const technicianId = req.user?.id as string;
    const service = await serviceService.createServiceIntoDB(technicianId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Service created successfully",
        data: service,
    });
});

export const serviceController = {
    getAllServices,
    createService,
};