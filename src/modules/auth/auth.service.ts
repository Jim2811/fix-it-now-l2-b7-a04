import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { IRegisterUserPayload } from "./auth.interface";
import { jwtUtils } from "../../utils/jwtUtils";
import { SignOptions } from "jsonwebtoken";

const registerUserInDB = async (payload: IRegisterUserPayload) => {
    const { name, email, password, profileImg, role, address, phone } = payload;
    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (existingUser) {
        throw new Error("User with this email already exists");
    }
    const hashedPassword = await bcrypt.hash(password, config.bcrypt_salt_rounds);
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

    if (!user) {
        throw new Error("User not found");
    };
    if (user.status == "BANNED") {
        throw new Error("Your account is banned");
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
        throw new Error("Invalid password");
    };
    delete (user as any).password;
    const jwtPayload = user
    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );
    
    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    );

    return {
        user,
        accessToken,
        refreshToken
    }

};

const getMyProfileFromDB = async (userId: string) => {
  
    const user = await prisma.user.findUniqueOrThrow({
        where : {id : userId},
        omit : {
            password : true
        },
    });
    return user
}
export const authService = {
    registerUserInDB,
    loginUserInDB,
    getMyProfileFromDB
}