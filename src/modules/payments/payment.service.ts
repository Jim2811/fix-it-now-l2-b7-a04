import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { IConfirmPaymentPayload, ICreatePaymentPayload } from "./payment.interface";
import { BookingStatus, PaymentStatus, PaymentProvider } from "../../../generated/prisma/enums";

const stripe = new Stripe(config.stripe_secret_key, {
    apiVersion: "2026-06-24.dahlia",
});

const createPaymentSessionIntoDB = async (customerId: string, payload: ICreatePaymentPayload) => {
    const { bookingId } = payload;

    const booking = await prisma.booking.findFirst({
        where: {
            id: bookingId,
            customerId,
        },
        include: {
            service: {
                include: {
                    category: true,
                },
            },
            customer: true,
            payment: true,
        },
    });

    if (!booking) {
        throw new Error("Booking not found");
    }

    if (booking.status !== BookingStatus.ACCEPTED) {
        throw new Error("Payment is allowed only after booking is accepted");
    }

    if (booking.payment?.status === PaymentStatus.COMPLETED) {
        throw new Error("This booking is already paid");
    }

    const amountInCents = Math.round(booking.service.price * 100);

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: booking.service.name,
                        description: booking.service.description,
                    },
                    unit_amount: amountInCents,
                },
            },
        ],
        customer_email: booking.customer.email,
        success_url: `${config.client_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.client_url}/payment/cancel`,
        metadata: {
            bookingId: booking.id,
            customerId: booking.customerId,
        },
    });

    const payment = await prisma.payment.upsert({
        where: {
            bookingId: booking.id,
        },
        update: {
            transactionId: session.id,
            amount: booking.service.price,
            provider: PaymentProvider.STRIPE,
            status: PaymentStatus.PENDING,
        },
        create: {
            bookingId: booking.id,
            transactionId: session.id,
            amount: booking.service.price,
            provider: PaymentProvider.STRIPE,
            status: PaymentStatus.PENDING,
        },
        include: {
            booking: {
                include: {
                    service: {
                        include: {
                            category: true,
                        },
                    },
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            address: true,
                            role: true,
                            status: true,
                            profileImg: true,
                        },
                    },
                },
            },
        },
    });

    return {
        payment,
        checkoutUrl: session.url,
        sessionId: session.id,
    };
};

const confirmPaymentIntoDB = async (customerId: string, payload: IConfirmPaymentPayload) => {
    const { sessionId } = payload;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const payment = await prisma.payment.findUnique({
        where: {
            transactionId: session.id,
        },
        include: {
            booking: true,
        },
    });

    if (!payment) {
        throw new Error("Payment not found");
    }

    if (payment.booking.customerId !== customerId) {
        throw new Error("You do not have permission to confirm this payment");
    }

    if (session.payment_status !== "paid") {
        return prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.FAILED },
            include: { booking: true },
        });
    }

    const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
            status: PaymentStatus.COMPLETED,
            paidAt: payment.paidAt ?? new Date(),
        },
        include: {
            booking: {
                include: {
                    service: true,
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            address: true,
                            role: true,
                            status: true,
                            profileImg: true,
                        },
                    },
                },
            },
        },
    });

    await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: BookingStatus.PAID },
    });

    return updatedPayment;
};

const handleStripeWebhookIntoDB = async (event: Stripe.Event) => {
    if (event.type !== "checkout.session.completed") {
        return {
            received: true,
            processed: false,
        };
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
        return {
            received: true,
            processed: false,
        };
    }

    const payment = await prisma.payment.findUnique({
        where: {
            transactionId: session.id,
        },
        include: {
            booking: true,
        },
    });

    if (!payment) {
        return {
            received: true,
            processed: false,
        };
    }

    if (session.payment_status !== "paid") {
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.FAILED },
        });

        return {
            received: true,
            processed: true,
            status: PaymentStatus.FAILED,
        };
    }

    const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
            status: PaymentStatus.COMPLETED,
            paidAt: payment.paidAt ?? new Date(),
        },
    });

    await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: BookingStatus.PAID },
    });

    return {
        received: true,
        processed: true,
        payment: updatedPayment,
        bookingStatus: BookingStatus.PAID,
    };
};

const getMyPaymentsFromDB = async (customerId: string) => {
    return prisma.payment.findMany({
        where: {
            booking: {
                customerId,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            booking: {
                include: {
                    service: {
                        include: {
                            category: true,
                        },
                    },
                    technician: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    phone: true,
                                    address: true,
                                    role: true,
                                    status: true,
                                    profileImg: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};

const getPaymentByIdFromDB = async (customerId: string, paymentId: string) => {
    const payment = await prisma.payment.findFirst({
        where: {
            id: paymentId,
            booking: {
                customerId,
            },
        },
        include: {
            booking: {
                include: {
                    service: {
                        include: {
                            category: true,
                        },
                    },
                    technician: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    phone: true,
                                    address: true,
                                    role: true,
                                    status: true,
                                    profileImg: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!payment) {
        throw new Error("Payment not found");
    }

    return payment;
};

export const paymentService = {
    createPaymentSessionIntoDB,
    confirmPaymentIntoDB,
    handleStripeWebhookIntoDB,
    getMyPaymentsFromDB,
    getPaymentByIdFromDB,
};