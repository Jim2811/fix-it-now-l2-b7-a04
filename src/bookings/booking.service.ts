import { prisma } from "../lib/prisma";
import { ICreateBookingPayload } from "./booking.interface";

const createBookingIntoDB = async (customerId: string, payload: ICreateBookingPayload) => {
    const { serviceId, slotDateTime } = payload;

    const service = await prisma.service.findUnique({
        where: {
            id: serviceId,
        },
        include: {
            technician: true,
            category: true,
        },
    });

    if (!service) {
        throw new Error("Service not found");
    }

    const booking = await prisma.booking.create({
        data: {
            customerId,
            technicianId: service.technicianId,
            serviceId: service.id,
            slotDateTime: new Date(slotDateTime),
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
            technician: {
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
                },
            },
            service: {
                include: {
                    category: true,
                },
            },
        },
    });

    return booking;
};

export const bookingService = {
    createBookingIntoDB,
};