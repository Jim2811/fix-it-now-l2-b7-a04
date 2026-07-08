import { Router } from "express";
import { technicianController } from "./technician.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/client";
const router = Router();

router.put("/profile", auth(Role.TECHNICIAN), technicianController.updateTechnicainProfile);
export const technicianRouter = router;