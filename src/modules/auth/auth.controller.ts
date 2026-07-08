import httpStatus from 'http-status';
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";

const registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = await authService.registerUserInDB(payload);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User registered successfully!",
        data: { user }
    })
});

const loginUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUserInDB(payload);
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7 
    })
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully!",
        data: { user }
    })
});
const getMyProfile = catchAsync( async (req: Request, res: Response, next: NextFunction) => {

    const profile = await authService.getMyProfileFromDB(req.user?.id as string);


    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User profile fetched successfully",
        data: { profile }
    })
})
export const authController = {
    registerUser,
    loginUser,
    getMyProfile
};