import Link from "next/link";
import type { House } from "@prisma/client";
import styles from "./HouseCard.module.css";

const fallbackImage = "/default.webp";

export function HouseCard({ house, href }: { house: House; href?: string }) {
  const images = Array.isArray(house.images) ? house.images : [];
  const image = typeof images[0] === "string" ? images[0] : fallbackImage;

  if (!href) {
    return (
    <div className={`glass-panel ${styles.card}`}>
      <div
        className={styles.image}
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <h3>{house.title}</h3>
          <span className="badge">до {house.maxGuests} гостей</span>
        </div>
        <p className={styles.description}>{house.description}</p>
        <div className={styles.priceRow}>
          <span className="text-lg font-semibold">{house.basePricePerNight} ₽ / ночь</span>
        </div>
      </div>
    </div>
    );
  }

  return (
    <Link href={href} className={styles.link}>
      <div className={`glass-panel ${styles.card} ${styles.cardHover}`}>
        <div
          className={styles.image}
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className={styles.content}>
          <div className={styles.titleRow}>
            <h3 className="text-xl font-semibold font-display">{house.title}</h3>
            <span className="badge">до {house.maxGuests} гостей</span>
          </div>
          <p className={styles.description}>{house.description}</p>
          <div className={styles.priceRow}>
            <span className="text-lg font-semibold">{house.basePricePerNight} ₽ / ночь</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
