import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import { auth } from "../middleware/auth";
import { categoryController } from "./categories/category.controller";
import { bookingController } from "./bookings/booking.controller";
import { userController } from "./users/user.controller";

const router = Router();

router.get("/categories", auth(Role.ADMIN), categoryController.getAllCategories);
router.post("/categories", auth(Role.ADMIN), categoryController.createCategory);
router.get("/bookings", auth(Role.ADMIN), bookingController.getAllBookings);
router.get("/users", auth(Role.ADMIN), userController.getAllUsers);
router.patch("/users/:id", auth(Role.ADMIN), userController.updateUserStatus);

export const adminRoutes = router;