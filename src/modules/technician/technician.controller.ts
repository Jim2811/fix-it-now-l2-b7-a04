import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { technicianService } from "./technician.service";

const updateTechnicainProfile = catchAsync(async (req: Request, res: Response) => {
    const technicianId  = req.user?.id;
    const updatedProfile = await technicianService.updateTechnicianProfileIntoDB(technicianId as string, req.body);
    res.status(200).json({
        success: true,
        message: "Technician profile updated successfully",
        data: updatedProfile,
    });
});

export const technicianController = { 
    updateTechnicainProfile 
};
