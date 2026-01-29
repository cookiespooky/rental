import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type UpdatePayload = {
  status?: string;
  holdUntil?: string | null;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json()) as UpdatePayload;
  const data: Record<string, unknown> = {};

  if (body.status) data.status = body.status;
  if (body.holdUntil !== undefined) {
    data.holdUntil = body.holdUntil ? new Date(body.holdUntil) : null;
  }

  const booking = await prisma.booking.update({
    where: { id },
    data,
  });

  return NextResponse.json({ booking });
}
