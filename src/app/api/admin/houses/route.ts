import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const houses = await prisma.house.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ houses });
}

export async function POST(req: Request) {
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

  if (!title || !slug || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const house = await prisma.house.create({
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
