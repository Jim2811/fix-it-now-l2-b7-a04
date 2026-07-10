import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(404, "Route not found", `Cannot ${req.method} ${req.originalUrl}`));
};