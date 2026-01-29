import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [houses, extras] = await Promise.all([
    prisma.house.findMany({
      where: { active: true },
      orderBy: { title: "asc" },
    }),
    prisma.extra.findMany({
      where: { active: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return NextResponse.json({ houses, extras });
}
