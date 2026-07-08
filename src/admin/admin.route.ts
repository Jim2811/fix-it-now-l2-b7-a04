import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import { auth } from "../middleware/auth";
import { categoryController } from "./categories/category.controller";

const router = Router();

router.get("/categories", auth(Role.ADMIN), categoryController.getAllCategories);
router.post("/categories", auth(Role.ADMIN), categoryController.createCategory);

export const adminRoutes = router;