import { prisma } from "../../lib/prisma";
import { IUpdateTechnicianPayload } from "./technician.interface";

const updateTechnicianProfileIntoDB = async (technicianId: string, payload: IUpdateTechnicianPayload) => {
    const { name, phone, address, profileImg, experience, hourlyRate, ...profileData } = payload;

    if (name || phone || address || profileImg) {
        await prisma.user.update({
            where: { id: technicianId },
            data: { name, phone, address, profileImg }
        });
    }
    const expNum =experience as number
    const rateNum = hourlyRate as number

    return await prisma.technicianProfile.upsert({
        where: { userId: technicianId },
        update: { 
            ...profileData, 
            experience: expNum, 
            hourlyRate: rateNum
        },
        create: {
            userId: technicianId,
            ...profileData,
            experience: expNum,
            hourlyRate: rateNum,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    address: true,
                    role: true,
                    status: true,
                    profileImg: true,
                }
            }
        }
    });
};



export const technicianService = {
    updateTechnicianProfileIntoDB,
};