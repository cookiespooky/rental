"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IMaskInput } from "react-imask";
import styles from "./SiteFooter.module.css";
import {
  brandName,
  ctaLabel,
  phoneHref,
  phoneLabel,
  phoneMask,
  phonePlaceholder,
  phonePrepare,
} from "./siteContact";

export function SiteFooter() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.inner}>
          <Link href="/" className={styles.left} aria-label="На главную">
            <div className={styles.logo}>
              <Image
                src="/logo.webp"
                alt="Логотип"
                width={28}
                height={28}
                className={styles.logoImage}
              />
            </div>
            <div className={styles.brandBlock}>
              <span className={styles.brand}>{brandName}</span>
            </div>
          </Link>
          <div className={styles.middle}>
            <span className={styles.phone}>{phoneLabel}</span>
            <button
              type="button"
              className={styles.ctaButton}
              onClick={() => setIsOpen(true)}
            >
              {ctaLabel}
            </button>
            <a href={phoneHref} className={styles.phoneInline}>
              {phoneLabel}
            </a>
          </div>
          <div className={styles.right}>
            <div className={styles.links}>
              <button
                type="button"
                className={styles.docButton}
                onClick={(event) => event.preventDefault()}
                aria-disabled="true"
              >
                Политика конфиденциальности
              </button>
              <button
                type="button"
                className={styles.docButton}
                onClick={(event) => event.preventDefault()}
                aria-disabled="true"
              >
                Публичная оферта
              </button>
            </div>
          </div>
        </div>
      </footer>
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
                <p className={styles.modalTitle}>Заявка на звонок</p>
                <a href={phoneHref} className={styles.modalPhone}>
                  {phoneLabel}
                </a>
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
            <form
              className={styles.form}
              onSubmit={(event) => event.preventDefault()}
            >
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
