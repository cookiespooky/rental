import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatDate, parseDateInput } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  if (!fromParam || !toParam) {
    return NextResponse.json(
      { error: "from and to are required" },
      { status: 400 }
    );
  }

  const fromDate = parseDateInput(fromParam);
  const toDate = parseDateInput(toParam);

  if (!fromDate || !toDate || fromDate >= toDate) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  const houses = await prisma.house.findMany({
    where: { active: true },
    select: { id: true },
  });

  if (houses.length === 0) {
    return NextResponse.json({ dates: [] });
  }

  const now = new Date();
  const bookings = await prisma.booking.findMany({
    where: {
      startDate: { lt: toDate },
      endDate: { gt: fromDate },
      status: { in: ["PAID", "MANUAL", "PENDING_PAYMENT", "HOLD"] },
    },
    select: { houseId: true, startDate: true, endDate: true, status: true, holdUntil: true },
  });

  const busyByHouse = new Map<string, { start: Date; end: Date }[]>();
  for (const booking of bookings) {
    if (booking.status === "HOLD" && (!booking.holdUntil || booking.holdUntil <= now)) {
      continue;
    }
    const list = busyByHouse.get(booking.houseId) ?? [];
    list.push({ start: booking.startDate, end: booking.endDate });
    busyByHouse.set(booking.houseId, list);
  }

  const dates: string[] = [];
  const cursor = new Date(fromDate);
  while (cursor < toDate) {
    const hasAvailability = houses.some((house) => {
      const intervals = busyByHouse.get(house.id) ?? [];
      return !intervals.some(
        (interval) => cursor >= interval.start && cursor < interval.end
      );
    });
    if (hasAvailability) {
      dates.push(formatDate(cursor));
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return NextResponse.json({ dates });
}
