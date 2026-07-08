import { prisma } from "../lib/prisma";

const getTechnicianProfileFromDB = async (technicianId: string) => {
    const profile = await prisma.technicianProfile.findUnique({
        where: { userId: technicianId },
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
            },
            availability: true,
            reviews: true,
        }
    });
    if (!profile) {
        throw new Error("Technician profile not found");
    };
    return profile
};

const getAllTechniciansFromDB = async (query: any) => {
    const { searchTerm, skills, minExperience, maxHourlyRate } = query;

    const technician = await prisma.user.findMany({
        where: {
            role: "TECHNICIAN",
            
            name: searchTerm ? { contains: searchTerm, mode: 'insensitive' } : undefined,

            technicianProfile: (skills || minExperience || maxHourlyRate) ? {
                skills: skills ? { has: skills } : undefined,
                experience: minExperience ? { gte: Number(minExperience) } : undefined,
                hourlyRate: maxHourlyRate ? { lte: Number(maxHourlyRate) } : undefined,
            } : undefined
        },
        omit: {
            password: true,
        },
        include: {
            technicianProfile: true
        }
    });

    return technician;
};



export const techniciansService = {
    getTechnicianProfileFromDB,
    getAllTechniciansFromDB,
}