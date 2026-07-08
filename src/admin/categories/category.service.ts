import { prisma } from "../../lib/prisma";

type TCategoryPayload = {
    name: string;
    description?: string;
};

const getAllCategoriesFromDB = async () => {
    return prisma.category.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
};

const createCategoryIntoDB = async (payload: TCategoryPayload) => {
    
};

export const categoryService = {
    getAllCategoriesFromDB,
    createCategoryIntoDB,
};