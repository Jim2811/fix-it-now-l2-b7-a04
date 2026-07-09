import { Router } from "express";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middleware/auth";
import { reviewController } from "./review.controller";
import { reviewValidation } from "./review.validation";

const router = Router();

router.post("/", auth(Role.CUSTOMER), reviewValidation.validateCreateReview, reviewController.createReview);
router.get("/", auth(Role.CUSTOMER), reviewController.getMyReviews);

export const reviewRoutes = router;