import { BookingStatus, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { ICreateReviewPayload } from "./review.interface";

const createReviewIntoDB = async (customerId: string, payload: ICreateReviewPayload) => {
    const { bookingId, rating, comment } = payload;

    const booking = await prisma.booking.findFirst({
        where: {
            id: bookingId,
            customerId,
        },
        include: {
            review: true,
        },
    });

    if (!booking) {
        throw new AppError(404, "Booking not found");
    }

    if (booking.status !== BookingStatus.COMPLETED) {
        throw new AppError(400, "Review is allowed only after job completion");
    }

    if (booking.review) {
        throw new AppError(400, "Review already exists for this booking");
    }

    const technicianId = booking.technicianId;

    const review = await prisma.review.create({
        data: {
            bookingId: booking.id,
            customerId,
            technicianId,
            rating,
            comment,
        },
        include: {
            booking: {
                include: {
                    service: {
                        include: {
                            category: true,
                        },
                    },
                },
            },
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
        },
    });

    const aggregate = await prisma.review.aggregate({
        where: { technicianId },
        _avg: {
            rating: true,
        },
    });

    await prisma.technicianProfile.update({
        where: { id: technicianId },
        data: {
            averageRating: aggregate._avg.rating ?? rating,
        },
    });

    return review;
};

const getMyReviewsFromDB = async (customerId: string) => {
    return prisma.review.findMany({
        where: { customerId },
        orderBy: { createdAt: "desc" },
        include: {
            booking: {
                include: {
                    service: {
                        include: {
                            category: true,
                        },
                    },
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
        },
    });
};

export const reviewService = {
    createReviewIntoDB,
    getMyReviewsFromDB,
};