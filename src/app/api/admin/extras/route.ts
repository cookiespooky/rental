import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const extras = await prisma.extra.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ extras });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, slug, price, priceType, active } = body || {};

  if (!title || !slug || !priceType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const extra = await prisma.extra.create({
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
