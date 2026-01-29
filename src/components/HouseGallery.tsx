"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import styles from "./HouseGallery.module.css";

type HouseGalleryProps = {
  images: string[];
  title: string;
};

const fallbackImage = "/default.webp";

export function HouseGallery({ images, title }: HouseGalleryProps) {
  const galleryImages = useMemo(() => {
    if (!images.length) {
      return [fallbackImage];
    }
    return images;
  }, [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];

  return (
    <div className={styles.gallery}>
      <div className={styles.hero}>
        <Image
          src={activeImage}
          alt={`${title} фото ${activeIndex + 1}`}
          fill
          priority
          className={styles.heroImage}
          sizes="(min-width: 900px) calc(100vw - 3rem - 360px), 100vw"
        />
      </div>
      {galleryImages.length > 1 ? (
        <div className={styles.thumbs}>
          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={
                index === activeIndex
                  ? `${styles.thumbButton} ${styles.thumbActive}`
                  : styles.thumbButton
              }
              onClick={() => setActiveIndex(index)}
              aria-label={`Показать фото ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${title} превью ${index + 1}`}
                width={160}
                height={120}
                className={styles.thumbImage}
                sizes="80px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
