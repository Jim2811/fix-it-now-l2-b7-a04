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

const addAvailabilityIntoDB = async (userId: string, payload: any[]) => {
    const technician = await prisma.technicianProfile.findUniqueOrThrow({
        where: { userId }
    });

    const queries = payload.map((slot) =>
        prisma.availability.upsert({
            where: {
                technicianId_dayOfWeek_startTime_endTime: {
                    technicianId: technician.id,
                    dayOfWeek: slot.dayOfWeek,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                },
            },
            update: {
                isAvailable: slot.isAvailable,
            },
            create: {
                technicianId: technician.id,
                dayOfWeek: slot.dayOfWeek,
                startTime: slot.startTime,
                endTime: slot.endTime,
                isAvailable: slot.isAvailable ?? true,
            },
        })
    );

    return await prisma.$transaction(queries);
};
export const technicianService = {
    updateTechnicianProfileIntoDB,
    addAvailabilityIntoDB
};