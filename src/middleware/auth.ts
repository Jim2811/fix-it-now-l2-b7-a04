import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import config from "../config";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwtUtils";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: Role;
                phone: string | null;
                address: string | null;
                status: UserStatus;
                profileImg: string | null;
            }
        }
    }
}
export const auth = (...requiredRoles: Role[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies?.accessToken ?
            req.cookies.accessToken
            :
            req.headers.authorization?.startsWith("Bearer ") ?
                req.headers.authorization?.split(" ")[1]
                : req.headers.authorization;

        if (!token) {
            throw new Error("You are not logged in. Please log in to access this resource.");
        }

        const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret as string);

        if (!verifiedToken.success) {
            throw new Error(verifiedToken.error || "Invalid token");
        }

        const { id } = verifiedToken.data as JwtPayload;
        const user = await prisma.user.findUnique({
            where: { id: id as string },
        });

        if (!user) {
            throw new Error("The user belonging to this token no longer exists.");
        }

        if (requiredRoles.length && !requiredRoles.includes(user.role)) {
            throw new Error("Forbidden. You don't have permission to access this resource.");
        }

        if (user.status === UserStatus.BANNED) {
            throw new Error("Your account is banned");
        }

        req.user = user;

        next();
    });
};