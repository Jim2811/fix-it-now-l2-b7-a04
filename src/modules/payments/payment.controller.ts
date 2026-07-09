import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";
import Stripe from "stripe";
import config from "../../config";

const createPayment = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id as string;
    const result = await paymentService.createPaymentSessionIntoDB(customerId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Payment session created successfully",
        data: result,
    });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id as string;
    const result = await paymentService.confirmPaymentIntoDB(customerId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment confirmed successfully",
        data: result,
    });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id as string;
    const result = await paymentService.getMyPaymentsFromDB(customerId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payments fetched successfully",
        data: result,
    });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id as string;
    const paymentId = req.params.id;
    const result = await paymentService.getPaymentByIdFromDB(customerId, paymentId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment fetched successfully",
        data: result,
    });
});

const handleStripeWebhook = async (req: Request, res: Response) => {
    try {
        const stripe = new Stripe(config.stripe_secret_key, {
            apiVersion: "2026-06-24.dahlia",
        });

        const signature = req.headers["stripe-signature"] as string;

        if (!signature) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: "Validation error",
                errorDetails: "Missing Stripe signature header",
            });
        }

        const event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            config.stripe_webhook_secret
        );

        const result = await paymentService.handleStripeWebhookIntoDB(event);

        return res.status(httpStatus.OK).json({
            success: true,
            message: "Webhook processed successfully",
            errorDetails: null,
            data: result,
        });
    } catch (error) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Webhook error",
            errorDetails: (error as Error).message,
        });
    }
};

export const paymentController = {
    createPayment,
    confirmPayment,
    getMyPayments,
    getPaymentById,
    handleStripeWebhook,
};