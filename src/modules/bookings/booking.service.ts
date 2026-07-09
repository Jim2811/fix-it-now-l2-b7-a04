import { prisma } from "../../lib/prisma";
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

const getMyBookingsFromDB = async (customerId: string) => {
    return prisma.booking.findMany({
        where: {
            customerId,
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
                    services: {
                        include: {
                            category: true,
                        },
                    },
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

const getBookingByIdFromDB = async (customerId: string, bookingId: string) => {
    const booking = await prisma.booking.findFirst({
        where: {
            id: bookingId,
            customerId,
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
                    services: {
                        include: {
                            category: true,
                        },
                    },
                    availability: true,
                    reviews: true,
                },
            },
            service: {
                include: {
                    category: true,
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
                },
            },
            payment: true,
            review: true,
        },
    });

    if (!booking) {
        throw new Error("Booking not found");
    }

    return booking;
};

export const bookingService = {
    createBookingIntoDB,
    getMyBookingsFromDB,
    getBookingByIdFromDB,
};