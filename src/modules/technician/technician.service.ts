import { BookingStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { IUpdateTechnicianPayload } from "./technician.interface";

const updateTechnicianProfileIntoDB = async (technicianId: string, payload: IUpdateTechnicianPayload) => {
    const { name, phone, address, profileImg, experience, hourlyRate, ...profileData } = payload;

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

const getTechnicianBookingsFromDB = async (technicianUserId: string) => {
    const technicianProfile = await prisma.technicianProfile.findUniqueOrThrow({
        where: { userId: technicianUserId },
        select: { id: true },
    });

    return prisma.booking.findMany({
        where: {
            technicianId: technicianProfile.id,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            customer: {
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
            service: {
                include: {
                    category: true,
                },
            },
            payment: true,
            review: true,
        },
    });
};

type TUpdateBookingStatusPayload = {
    status: BookingStatus;
};

const updateBookingStatusIntoDB = async (
    technicianUserId: string,
    bookingId: string,
    payload: TUpdateBookingStatusPayload
) => {
    const { status } = payload;

    const technicianProfile = await prisma.technicianProfile.findUniqueOrThrow({
        where: { userId: technicianUserId },
        select: { id: true },
    });

    const booking = await prisma.booking.findFirst({
        where: {
            id: bookingId,
            technicianId: technicianProfile.id,
        },
    });

    if (!booking) {
        throw new Error("Booking not found");
    }

    const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
        REQUESTED: [BookingStatus.ACCEPTED, BookingStatus.DECLINED, BookingStatus.CANCELLED],
        ACCEPTED: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
        DECLINED: [],
        PAID: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
        IN_PROGRESS: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
        COMPLETED: [],
        CANCELLED: [],
    };

    if (!allowedTransitions[booking.status].includes(status)) {
        throw new Error(`Cannot change booking status from ${booking.status} to ${status}`);
    }

    return prisma.booking.update({
        where: { id: booking.id },
        data: { status },
        include: {
            customer: {
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
            service: {
                include: {
                    category: true,
                },
            },
            payment: true,
            review: true,
        },
    });
};

export const technicianService = {
    updateTechnicianProfileIntoDB,
    addAvailabilityIntoDB,
    getTechnicianBookingsFromDB,
    updateBookingStatusIntoDB,
};