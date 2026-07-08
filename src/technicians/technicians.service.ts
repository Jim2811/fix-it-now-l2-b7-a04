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

export const techniciansService = {
    getTechnicianProfileFromDB
}