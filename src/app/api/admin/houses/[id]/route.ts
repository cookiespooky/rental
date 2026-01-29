import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const {
    title,
    slug,
    description,
    images,
    basePricePerNight,
    maxGuests,
    active,
  } = body || {};

  const house = await prisma.house.update({
    where: { id },
    data: {
      title,
      slug,
      description,
      images: Array.isArray(images) ? images : [],
      basePricePerNight: Number(basePricePerNight || 0),
      maxGuests: Number(maxGuests || 1),
      active: Boolean(active),
    },
  });

  return NextResponse.json({ house });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.house.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
