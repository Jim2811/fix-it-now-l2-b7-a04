import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { RegisterUserPayload } from "./auth.interface"
import config from "../config";

const registerUserInDB = async (payload: RegisterUserPayload) => {
    const { name, email, password, profileImg, role, address, phone } = payload;
    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if(existingUser) {
        throw new Error("User with this email already exists");
    }
    const hashedPassword = await bcrypt.hash(password, config.bcrypt_salt_rounds );
    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            profileImg,
            role,
            address,
            phone
        }
    });
    const user = await prisma.user.findUnique({
        where: {
            id: newUser.id,
            email: newUser.email || email
        },
        omit: {
            password: true
        }
    })
    return user;
};
export const authService = {
    registerUserInDB,
}