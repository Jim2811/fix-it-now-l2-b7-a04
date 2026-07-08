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
    const { status } = payload;

    if (status !== UserStatus.BANNED && status !== UserStatus.UNBAN) {
        throw new Error("Invalid user status");
    }

    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            status,
        },
        omit: {
            password: true,
        },
    });
};

export const userService = {
    getAllUsersFromDB,
    updateUserStatusIntoDB,
};