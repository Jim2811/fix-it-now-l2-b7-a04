import { Router } from "express";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middleware/auth";
import { paymentController } from "./payment.controller";
import { paymentValidation } from "./payment.validation";

const router = Router();

router.post("/create", auth(Role.CUSTOMER), paymentValidation.validateCreatePayment, paymentController.createPayment);
router.post("/confirm", auth(Role.CUSTOMER), paymentValidation.validateConfirmPayment, paymentController.confirmPayment);
router.get("/", auth(Role.CUSTOMER), paymentController.getMyPayments);
router.get("/:id", auth(Role.CUSTOMER), paymentController.getPaymentById);

export const paymentRoutes = router;