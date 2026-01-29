"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IMaskInput } from "react-imask";
import styles from "./SiteHeader.module.css";
import {
  brandName,
  ctaLabel,
  phoneHref,
  phoneLabel,
  phoneMask,
  phonePlaceholder,
  phonePrepare,
} from "./siteContact";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href="/" className={styles.left} aria-label="На главную">
            <div className={styles.logo}>
              <Image
                src="/logo.webp"
                alt="Логотип"
                fill
                className={styles.logoImage}
              />
            </div>
            <span className={styles.brand}>{brandName}</span>
          </Link>
          <div className={styles.right}>
            <a href={phoneHref} className={styles.phone}>
              {phoneLabel}
            </a>
            <button
              type="button"
              className={styles.ctaButton}
              onClick={() => setIsOpen(true)}
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </header>
      {isOpen ? (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="Заявка"
          onClick={() => setIsOpen(false)}
        >
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalTitle}>Обратная связь</p>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column' }}>
              <div>Свяжитесь с нами</div>
              <a href={phoneHref} className={styles.modalPhone}>
                {phoneLabel}
              </a>
            </div>

            <form
              className={styles.form}
              onSubmit={(event) => event.preventDefault()}
            >
              <div>Или оставьте заявку</div>
              <label className={styles.field}>
                <span>Имя</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Ваше имя"
                  className={styles.input}
                />
              </label>
              <label className={styles.field}>
                <span>Телефон</span>
                <IMaskInput
                  mask={phoneMask}
                  type="tel"
                  name="phone"
                  placeholder={phonePlaceholder}
                  inputMode="tel"
                  autoComplete="tel"
                  prepare={phonePrepare}
                  className={styles.input}
                />
              </label>
              <button type="submit" className={styles.submitButton}>
                Отправить
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
