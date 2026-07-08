import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import { auth } from "../middleware/auth";
import { serviceController } from "./service.controller";

const router = Router();

router.get("/", serviceController.getAllServices);
router.post("/", auth(Role.TECHNICIAN), serviceController.createService);

export const serviceRoutes = router;