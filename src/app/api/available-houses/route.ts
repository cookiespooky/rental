import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseDateInput } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  if (!startParam || !endParam) {
    return NextResponse.json(
      { error: "start and end are required" },
      { status: 400 }
    );
  }

  const startDate = parseDateInput(startParam);
  const endDate = parseDateInput(endParam);

  if (!startDate || !endDate || startDate >= endDate) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  const now = new Date();

  const [houses, busyBookings] = await Promise.all([
    prisma.house.findMany({
      where: { active: true },
      orderBy: { title: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        startDate: { lt: endDate },
        endDate: { gt: startDate },
        status: { in: ["PAID", "MANUAL", "PENDING_PAYMENT", "HOLD"] },
      },
      select: { houseId: true, holdUntil: true, status: true },
    }),
  ]);

  const busyHouseIds = new Set(
    busyBookings
      .filter((booking) =>
        booking.status !== "HOLD" ? true : booking.holdUntil && booking.holdUntil > now
      )
      .map((booking) => booking.houseId)
  );

  const available = houses.filter((house) => !busyHouseIds.has(house.id));

  return NextResponse.json({ houses: available });
}
