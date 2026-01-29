import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { diffNights, parseDateInput } from "@/lib/dates";
import { calculateExtrasTotal, SelectedExtra } from "@/lib/pricing";

export const dynamic = "force-dynamic";

type CreateHoldPayload = {
  houseId: string;
  startDate: string;
  endDate: string;
  extras?: SelectedExtra[];
  guestName: string;
  phone: string;
  email?: string | null;
  comment?: string | null;
};

export async function POST(req: Request) {
  const body = (await req.json()) as CreateHoldPayload;

  if (!body.houseId || !body.startDate || !body.endDate || !body.guestName || !body.phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const startDate = parseDateInput(body.startDate);
  const endDate = parseDateInput(body.endDate);

  if (!startDate || !endDate || startDate >= endDate) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  const house = await prisma.house.findFirst({
    where: { id: body.houseId, active: true },
  });

  if (!house) {
    return NextResponse.json({ error: "House not found" }, { status: 404 });
  }

  const now = new Date();
  const conflict = await prisma.booking.findFirst({
    where: {
      houseId: body.houseId,
      startDate: { lt: endDate },
      endDate: { gt: startDate },
      OR: [
        { status: { in: ["PAID", "MANUAL", "PENDING_PAYMENT"] } },
        { status: "HOLD", holdUntil: { gt: now } },
      ],
    },
  });

  if (conflict) {
    return NextResponse.json({ error: "Dates are not available" }, { status: 409 });
  }

  const nights = diffNights(startDate, endDate);
  if (nights <= 0) {
    return NextResponse.json({ error: "Invalid number of nights" }, { status: 400 });
  }

  const requestedExtras = Array.isArray(body.extras) ? body.extras : [];
  const extrasIds = requestedExtras.map((extra) => extra.extraId);
  const extrasOptions = extrasIds.length
    ? await prisma.extra.findMany({
        where: { id: { in: extrasIds }, active: true },
        select: { id: true, price: true, priceType: true },
      })
    : [];

  const sanitizedExtras = requestedExtras
    .map((extra) => ({
      extraId: extra.extraId,
      qty: Math.max(1, Number(extra.qty || 1)),
    }))
    .filter((extra) => extrasOptions.some((option) => option.id === extra.extraId));

  const extrasTotal = calculateExtrasTotal(sanitizedExtras, extrasOptions, nights);
  const base = nights * house.basePricePerNight;
  const totalPrice = base + extrasTotal;

  const holdUntil = new Date(Date.now() + 10 * 60 * 1000);

  const booking = await prisma.booking.create({
    data: {
      houseId: house.id,
      startDate,
      endDate,
      status: "HOLD",
      holdUntil,
      guestName: body.guestName,
      phone: body.phone,
      email: body.email || null,
      comment: body.comment || null,
      extras: sanitizedExtras,
      nights,
      totalPrice,
    },
  });

  return NextResponse.json({ booking });
}
