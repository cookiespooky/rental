import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildTbankToken } from "@/lib/tbank";

export const dynamic = "force-dynamic";

type InitPayload = {
  bookingId: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as InitPayload;

  if (!body.bookingId) {
    return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: body.bookingId },
    include: { payment: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status === "CANCELLED" || booking.status === "PAID") {
    return NextResponse.json({ error: "Booking status not payable" }, { status: 400 });
  }

  if (booking.status === "HOLD" && (!booking.holdUntil || booking.holdUntil <= new Date())) {
    return NextResponse.json({ error: "Hold expired" }, { status: 400 });
  }

  const terminalKey = process.env.TBANK_TERMINAL_KEY;
  const password = process.env.TBANK_PASSWORD;
  const initUrl = process.env.TBANK_INIT_URL;
  const baseUrl = process.env.PUBLIC_BASE_URL;

  if (!terminalKey || !password || !initUrl || !baseUrl) {
    return NextResponse.json({ error: "Missing T-Bank configuration" }, { status: 500 });
  }

  const amount = booking.totalPrice * 100;

  const payload = {
    TerminalKey: terminalKey,
    Amount: amount,
    OrderId: booking.id,
    Description: `Booking ${booking.id}`,
    NotificationURL: `${baseUrl}/api/tbank/notify`,
    SuccessURL: `${baseUrl}/success?bookingId=${booking.id}`,
    FailURL: `${baseUrl}/fail?bookingId=${booking.id}`,
  };

  const token = buildTbankToken(payload, password);

  const response = await fetch(initUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, Token: token }),
  });

  const data = await response.json();

  if (!response.ok || data?.Success === false) {
    return NextResponse.json({ error: "T-Bank init failed", raw: data }, { status: 502 });
  }

  const paymentId = data?.PaymentId ? String(data.PaymentId) : null;
  const paymentUrl = data?.PaymentURL ?? null;
  const status = data?.Status ?? "INIT";

  const payment = await prisma.payment.upsert({
    where: { bookingId: booking.id },
    update: {
      amount,
      status,
      tbankPaymentId: paymentId ?? booking.payment?.tbankPaymentId ?? null,
      paymentUrl,
      rawInit: data,
    },
    create: {
      bookingId: booking.id,
      amount,
      status,
      tbankPaymentId: paymentId,
      paymentUrl,
      rawInit: data,
      provider: "TBANK",
    },
  });

  if (booking.status !== "PENDING_PAYMENT") {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "PENDING_PAYMENT" },
    });
  }

  return NextResponse.json({
    paymentUrl: payment.paymentUrl,
    tbankPaymentId: payment.tbankPaymentId,
    raw: data,
  });
}
