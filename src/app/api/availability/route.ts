import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatDate, parseDateInput } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const houseId = searchParams.get("houseId");
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  if (!houseId || !fromParam || !toParam) {
    return NextResponse.json(
      { error: "houseId, from, to are required" },
      { status: 400 }
    );
  }

  const fromDate = parseDateInput(fromParam);
  const toDate = parseDateInput(toParam);

  if (!fromDate || !toDate || fromDate >= toDate) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  const now = new Date();

  const bookings = await prisma.booking.findMany({
    where: {
      houseId,
      startDate: { lt: toDate },
      endDate: { gt: fromDate },
      status: { in: ["PAID", "MANUAL", "PENDING_PAYMENT", "HOLD"] },
    },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      status: true,
      holdUntil: true,
    },
    orderBy: { startDate: "asc" },
  });

  const intervals = bookings
    .filter((booking) =>
      booking.status !== "HOLD" ? true : booking.holdUntil && booking.holdUntil > now
    )
    .map((booking) => ({
      id: booking.id,
      status: booking.status,
      startDate: formatDate(booking.startDate),
      endDate: formatDate(booking.endDate),
    }));

  return NextResponse.json({ intervals });
}
