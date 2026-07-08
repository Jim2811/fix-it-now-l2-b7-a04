import { Router } from "express";
import { techniciansController } from "./technicians.controller";

const router = Router()
router.get("/:id", techniciansController.getMyProfile);
export const techniciansRouter = router;