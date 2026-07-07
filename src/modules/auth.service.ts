import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import config from "../config";
import { RegisterUserPayload } from "./auth.interface";

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

const loginUserInDB = async (payload: { email: string; password: string }) => {
    const { email, password } = payload;
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if(!user) {
        throw new Error("User not found");
    };
    if(user.status == "BANNED") {
        throw new Error("Your account is banned");
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if(!comparePassword) {
        throw new Error("Invalid password");
    };
    delete (user as any).password;
    return user

}
export const authService = {
    registerUserInDB,
    loginUserInDB
}