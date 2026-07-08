import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

type TUpdateUserStatusPayload = {
    status: UserStatus;
};

const getAllUsersFromDB = async () => {
    return prisma.user.findMany({
        omit: {
            password: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

const updateUserStatusIntoDB = async (userId: string, payload: TUpdateUserStatusPayload) => {
    
};

export const userService = {
    getAllUsersFromDB,
    updateUserStatusIntoDB,
};