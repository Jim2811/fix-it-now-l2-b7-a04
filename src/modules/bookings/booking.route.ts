import { Router } from "express";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middleware/auth";
import { bookingController } from "./booking.controller";

const router = Router();

router.post("/", auth(Role.CUSTOMER), bookingController.createBooking);
router.get("/", auth(Role.CUSTOMER), bookingController.getMyBookings);
router.get("/:id", auth(Role.CUSTOMER), bookingController.getBookingById);

export const bookingRoutes = router;