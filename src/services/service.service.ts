import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";

type TGetServicesQuery = {
    searchTerm?: string;
    categoryId?: string;
    technicianId?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
};

const getAllServicesFromDB = async (query: TGetServicesQuery) => {
    const {
        searchTerm,
        categoryId,
        technicianId,
        location,
        minPrice,
        maxPrice,
        minRating,
    } = query;

    const orFilters: Prisma.ServiceWhereInput[] = [];

    if (searchTerm) {
        orFilters.push(
            {
                name: { contains: searchTerm, mode: "insensitive" as Prisma.QueryMode },
            } as Prisma.ServiceWhereInput,
            {
                description: { contains: searchTerm, mode: "insensitive" as Prisma.QueryMode },
            } as Prisma.ServiceWhereInput,
            {
                category: {
                    name: { contains: searchTerm, mode: "insensitive" as Prisma.QueryMode },
                },
            } as Prisma.ServiceWhereInput,
            {
                technician: {
                    user: {
                        name: { contains: searchTerm, mode: "insensitive" as Prisma.QueryMode },
                    },
                },
            } as Prisma.ServiceWhereInput,
            { technician: { skills: { has: searchTerm } } } as Prisma.ServiceWhereInput
        );
    }

    if (location) {
        orFilters.push({
            technician: {
                user: {
                    address: { contains: location, mode: "insensitive" as Prisma.QueryMode },
                },
            },
        } as Prisma.ServiceWhereInput);
    }

    if (minRating) {
        orFilters.push({
            technician: {
                averageRating: {
                    gte: Number(minRating),
                },
            },
        } as Prisma.ServiceWhereInput);
    }

    const where: Prisma.ServiceWhereInput = {
        categoryId: categoryId ? categoryId : undefined,
        technicianId: technicianId ? technicianId : undefined,
        price: minPrice || maxPrice ? {
            gte: minPrice ? Number(minPrice) : undefined,
            lte: maxPrice ? Number(maxPrice) : undefined,
        } : undefined,
        ...(orFilters.length ? { OR: orFilters } : {}),
    };

    const services = await prisma.service.findMany({
        where,
        orderBy: {
            createdAt: "desc",
        },
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
                    availability: true,
                    reviews: true,
                },
            },
        },
    });

    return services;
};

export const serviceService = {
    getAllServicesFromDB,
};