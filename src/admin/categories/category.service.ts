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
    const { name, description } = payload;

    const existingCategory = await prisma.category.findUnique({
        where: { name },
    });

    if (existingCategory) {
        throw new Error("Category already exists");
    }

    return prisma.category.create({
        data: {
            name,
            description,
        },
    });
};

export const categoryService = {
    getAllCategoriesFromDB,
    createCategoryIntoDB,
};