import { Router } from "express";
import { technicianController } from "./technician.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/client";
const router = Router();

router.put("/profile", auth(Role.TECHNICIAN), technicianController.updateTechnicainProfile);
router.put("/availability", auth(Role.TECHNICIAN), technicianController.addAvailability);
router.get("/bookings", auth(Role.TECHNICIAN), technicianController.getTechnicianBookings);
router.patch("/bookings/:id", auth(Role.TECHNICIAN), technicianController.updateBookingStatus);
export const technicianRouter = router;