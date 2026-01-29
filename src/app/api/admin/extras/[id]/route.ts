import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { title, slug, price, priceType, active } = body || {};

  const extra = await prisma.extra.update({
    where: { id: params.id },
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
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.extra.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
