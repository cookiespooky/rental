import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { title, slug, price, priceType, active } = body || {};

  const extra = await prisma.extra.update({
    where: { id },
    data: {
      title,
      slug,
      price: Number(price || 0),
      priceType,
      active: Boolean(active),
    },
  });

  return NextResponse.json({ extra });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.extra.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
