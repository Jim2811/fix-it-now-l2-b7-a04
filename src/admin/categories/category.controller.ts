import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { categoryService } from "./category.service";

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const categories = await categoryService.getAllCategoriesFromDB();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Categories fetched successfully",
        data: categories,
    });
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
    
});

export const categoryController = {
    getAllCategories,
    createCategory,
};