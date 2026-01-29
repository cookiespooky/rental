import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

type FailPageProps = {
  searchParams: Promise<{ bookingId?: string }>;
};

export default async function FailPage({ searchParams }: FailPageProps) {
  const resolvedSearchParams = await searchParams;
  const bookingId = resolvedSearchParams.bookingId;
  const booking = bookingId
    ? await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { house: true },
      })
    : null;

  return (
    <div className="container-shell space-y-8">
      <div className="glass-panel rounded-3xl p-6 space-y-3">
        <h1 className="text-3xl font-semibold font-display">Оплата не прошла</h1>
        <p className="text-sm text-[#3f4b45]">
          Можно повторить попытку или выбрать другие даты.
        </p>
      </div>

      {booking ? (
        <div className="glass-panel rounded-3xl p-6 space-y-2">
          <p className="text-sm text-[#3f4b45]">Дом: {booking.house.title}</p>
          <p className="text-sm text-[#3f4b45]">
            Даты: {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
          </p>
          <p className="text-lg font-semibold">Статус: {booking.status}</p>
          <Link
            href={`/checkout/${booking.id}`}
            className="button-primary inline-flex"
          >
            Повторить оплату
          </Link>
        </div>
      ) : null}

      <Link href="/" className="button-secondary inline-flex">
        На главную
      </Link>
    </div>
  );
}
