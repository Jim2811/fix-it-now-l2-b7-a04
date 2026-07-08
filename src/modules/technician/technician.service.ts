import { prisma } from "../../lib/prisma";
import { IUpdateTechnicianPayload } from "./technician.interface";

const updateTechnicianProfileIntoDB = async (technicianId: string, payload: IUpdateTechnicianPayload) => {
    const { name, phone, address, profileImg, experience, hourlyRate, services, ...profileData } = payload;

    return await prisma.$transaction(async (tx) => {
        const userData: Record<string, unknown> = {};

        if (name !== undefined) userData.name = name;
        if (phone !== undefined) userData.phone = phone;
        if (address !== undefined) userData.address = address;
        if (profileImg !== undefined) userData.profileImg = profileImg;

        if (Object.keys(userData).length) {
            await tx.user.update({
                where: { id: technicianId },
                data: userData,
            });
        }

        const profileUpdateData: Record<string, unknown> = { ...profileData };

        if (experience !== undefined) {
            profileUpdateData.experience = Number(experience);
        }

        if (hourlyRate !== undefined) {
            profileUpdateData.hourlyRate = Number(hourlyRate);
        }

        const technicianProfile = await tx.technicianProfile.upsert({
            where: { userId: technicianId },
            update: profileUpdateData,
            create: {
                userId: technicianId,
                ...profileData,
                experience: experience !== undefined ? Number(experience) : 0,
                hourlyRate: hourlyRate !== undefined ? Number(hourlyRate) : 0,
            },
        });

        if (services?.length) {
            const categoryIds = [...new Set(services.map((service) => service.categoryId))];
            const existingCategories = await tx.category.findMany({
                where: { id: { in: categoryIds } },
                select: { id: true },
            });

            if (existingCategories.length !== categoryIds.length) {
                throw new Error("One or more categories not found");
            }

            await Promise.all(
                services.map(async (service) => {
                    const existingService = await tx.service.findFirst({
                        where: {
                            technicianId: technicianProfile.id,
                            name: service.name,
                            categoryId: service.categoryId,
                        },
                    });

                    if (existingService) {
                        return tx.service.update({
                            where: { id: existingService.id },
                            data: {
                                description: service.description,
                                price: Number(service.price),
                            },
                        });
                    }

                    return tx.service.create({
                        data: {
                            technicianId: technicianProfile.id,
                            name: service.name,
                            description: service.description,
                            price: Number(service.price),
                            categoryId: service.categoryId,
                        },
                    });
                })
            );
        }

        return await tx.technicianProfile.findUniqueOrThrow({
            where: { id: technicianProfile.id },
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
                    },
                },
                services: {
                    include: {
                        category: true,
                    },
                },
            },
        });
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