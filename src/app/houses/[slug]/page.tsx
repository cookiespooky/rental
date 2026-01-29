import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookingForm } from "@/components/BookingForm";
import { HouseGallery } from "@/components/HouseGallery";
import styles from "./HousePage.module.css";

export const dynamic = "force-dynamic";

type HousePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ start?: string; end?: string }>;
};

export default async function HousePage({ params, searchParams }: HousePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const house = await prisma.house.findFirst({
    where: { slug: resolvedParams.slug, active: true },
  });

  if (!house) {
    notFound();
  }

  const extras = await prisma.extra.findMany({
    where: { active: true },
    orderBy: { title: "asc" },
  });

  const images = Array.isArray(house.images)
    ? house.images.filter((image): image is string => typeof image === "string")
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.houseGrid}>
        <div className={styles.leftColumn}>
          <HouseGallery
            images={images}
            title={house.title}
          />
            <h1 className={styles.title}>{house.title}</h1>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <p className={`${styles.subtitle} badge`}>до {house.maxGuests} гостей</p>
              <p className={`${styles.subtitle} badge`}>{house.basePricePerNight} ₽ / ночь</p>
            </div>

          <p className={styles.description}>{house.description}</p>

          {/*}
          <div className={styles.priceCard}>
            <p className={styles.priceLabel}>Базовая стоимость</p>
            <p className={styles.priceValue}>{house.basePricePerNight} ₽ / ночь</p>
          </div>
          */}

        </div>
        <BookingForm
          house={house}
          extras={extras}
          initialStart={resolvedSearchParams.start}
          initialEnd={resolvedSearchParams.end}
        />
      </div>
    </div>
  );
}
