import { prisma } from "@/lib/prisma";
import { parseDateInput } from "@/lib/dates";
import { HouseCard } from "@/components/HouseCard";
import { HomeSearchPicker } from "@/components/HomeSearchPicker";
import styles from "./SearchPage.module.css";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{ start?: string; end?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const startParam = resolvedSearchParams.start ?? null;
  const endParam = resolvedSearchParams.end ?? null;
  const startDate = startParam ? parseDateInput(startParam) : null;
  const endDate = endParam ? parseDateInput(endParam) : null;
  const formatSearchDate = (value: Date | null) =>
    value
      ? new Intl.DateTimeFormat("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(value)
      : null;
  const formattedStart = formatSearchDate(startDate);
  const formattedEnd = formatSearchDate(endDate);

  if (!startDate || !endDate || startDate >= endDate) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Поиск доступных домов</h1>
          <div className={styles.subtitle}>
            {formattedStart && formattedEnd
              ? `Даты: ${formattedStart} — ${formattedEnd}`
              : "Даты: выберите даты"}
          </div>
        </div>
        <HomeSearchPicker
          initialStart={startParam}
          initialEnd={endParam}
          autoCloseOnComplete
        />
      </div>
    );
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Свободные дома</h1>
      </div>

      <HomeSearchPicker
        initialStart={startParam}
        initialEnd={endParam}
        autoCloseOnComplete
      />

      {available.length === 0 ? (
        <div className={styles.emptyCard}>
          <p className={styles.emptyText}>
            На выбранные даты нет свободных домов. Попробуйте другие даты.
          </p>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {available.map((house) => (
            <HouseCard
              key={house.id}
              house={house}
              href={`/houses/${house.slug}?start=${startParam}&end=${endParam}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
