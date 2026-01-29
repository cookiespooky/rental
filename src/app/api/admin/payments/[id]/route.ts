import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type UpdatePayload = {
  status?: string;
  paymentUrl?: string | null;
  tbankPaymentId?: string | null;
  amount?: number;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json()) as UpdatePayload;
  const data: Record<string, unknown> = {};

  if (body.status) data.status = body.status;
  if (body.paymentUrl !== undefined) data.paymentUrl = body.paymentUrl;
  if (body.tbankPaymentId !== undefined) data.tbankPaymentId = body.tbankPaymentId;
  if (body.amount !== undefined) data.amount = Number(body.amount);

  const payment = await prisma.payment.update({
    where: { id },
    data,
  });

  return NextResponse.json({ payment });
}
