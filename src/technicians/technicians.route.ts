import { Router } from "express";
import { techniciansController } from "./technicians.controller";

const router = Router()
router.get("/:id", techniciansController.getMyProfile);
router.get("/", techniciansController.getAllTechnicians);
export const techniciansRouter = router;