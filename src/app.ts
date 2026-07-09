import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import { adminRoutes } from "./admin/admin.route";
import { bookingRoutes } from "./modules/bookings/booking.route";
import { authRoutes } from "./modules/auth/auth.route";
import { technicianRouter } from "./modules/technician/technician.route";
import { techniciansRouter } from "./modules/technicians/technicians.route";
import { serviceRoutes } from "./modules/services/service.route";
import { paymentRoutes } from "./modules/payments/payment.route";
import { paymentController } from "./modules/payments/payment.controller";
import { reviewRoutes } from "./modules/reviews/review.route";

const app : Application = express();

app.use(cors({
    origin : config.app_url,
    credentials : true,
}))

app.post("/api/payments/webhook", express.raw({ type: "application/json" }), paymentController.handleStripeWebhook);
app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser());


app.get("/",(req : Request, res : Response) => {
    res.send("Initializing FixItNow!");
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/technician", technicianRouter);
app.use("/api/technicians", techniciansRouter);
export default app;