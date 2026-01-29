"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Extra, House } from "@prisma/client";
import { calculateExtrasTotal, SelectedExtra } from "@/lib/pricing";
import { diffNights, formatDate, parseDateInput } from "@/lib/dates";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import { ru } from "date-fns/locale";
import { IMaskInput } from "react-imask";
import styles from "./BookingForm.module.css";
import { phoneMask, phonePlaceholder, phonePrepare } from "./siteContact";

type ExtrasState = {
  extraId: string;
  title: string;
  price: number;
  priceType: Extra["priceType"];
  enabled: boolean;
  qty: number;
};

export function BookingForm({
  house,
  extras,
  initialStart,
  initialEnd,
}: {
  house: House;
  extras: Extra[];
  initialStart?: string | null;
  initialEnd?: string | null;
}) {
  const router = useRouter();
  const initialRange = useMemo<DateRange | undefined>(() => {
    const from = initialStart ? parseDateInput(initialStart) : null;
    const to = initialEnd ? parseDateInput(initialEnd) : null;
    if (!from) return undefined;
    return { from, to: to ?? undefined };
  }, [initialStart, initialEnd]);

  const [range, setRange] = useState<DateRange | undefined>(initialRange);
  const [openPicker, setOpenPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [intervals, setIntervals] = useState<
    { startDate: string; endDate: string; status: string; id: string }[]
  >([]);

  const [extrasState, setExtrasState] = useState<ExtrasState[]>(
    extras.map((extra) => ({
      extraId: extra.id,
      title: extra.title,
      price: extra.price,
      priceType: extra.priceType,
      enabled: false,
      qty: 1,
    }))
  );

  useEffect(() => {
    const controller = new AbortController();
    const fetchAvailability = async () => {
      setAvailabilityError(null);
      try {
        const today = new Date();
        const start = new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
        );
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 180);

        const response = await fetch(
          `/api/availability?houseId=${house.id}&from=${formatDate(
            start
          )}&to=${formatDate(end)}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        if (!response.ok) {
          setAvailabilityError(data?.error || "Не удалось загрузить занятость.");
          return;
        }
        setIntervals(data.intervals ?? []);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setAvailabilityError("Не удалось загрузить занятость.");
      }
    };

    fetchAvailability();

    return () => controller.abort();
  }, [house.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!pickerRef.current) return;
      if (event.target instanceof Node && pickerRef.current.contains(event.target)) {
        return;
      }
      setOpenPicker(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenPicker(false);
      }
    };

    if (openPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openPicker]);

  const busyIntervals = useMemo(() => {
    return intervals
      .map((interval) => ({
        start: parseDateInput(interval.startDate),
        end: parseDateInput(interval.endDate),
      }))
      .filter((interval): interval is { start: Date; end: Date } => {
        return Boolean(interval.start && interval.end);
      });
  }, [intervals]);

  const todayUtc = useMemo(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }, []);

  const toUtcDate = (date: Date) =>
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  const startDate = range?.from ? formatDate(range.from) : "";
  const endDate = range?.to ? formatDate(range.to) : "";

  const isDateBlocked = (date: Date) => {
    const normalized = toUtcDate(date);
    if (normalized < todayUtc) return true;
    return busyIntervals.some(
      (interval) => normalized >= interval.start && normalized < interval.end
    );
  };

  const isRangeAvailable = (from: Date, to: Date) => {
    const cursor = new Date(from);
    while (cursor < to) {
      if (isDateBlocked(cursor)) return false;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return true;
  };

  const hasConflict = useMemo(() => {
    const start = range?.from ?? null;
    const end = range?.to ?? null;
    if (!start || !end) return false;
    return busyIntervals.some((interval) => start < interval.end && interval.start < end);
  }, [busyIntervals, range]);

  const { nights, extrasTotal, totalPrice } = useMemo(() => {
    const start = range?.from ?? null;
    const end = range?.to ?? null;
    if (!start || !end || start >= end) {
      return {
        nights: 0,
        extrasTotal: 0,
        totalPrice: house.basePricePerNight,
      };
    }
    const computedNights = diffNights(start, end);
    const selectedExtras: SelectedExtra[] = extrasState
      .filter((extra) => extra.enabled)
      .map((extra) => ({ extraId: extra.extraId, qty: extra.qty }));
    const options = extrasState.map((extra) => ({
      id: extra.extraId,
      price: extra.price,
      priceType: extra.priceType,
    }));
    const extraSum = calculateExtrasTotal(selectedExtras, options, computedNights);
    const base = computedNights * house.basePricePerNight;
    return { nights: computedNights, extrasTotal: extraSum, totalPrice: base + extraSum };
  }, [range, extrasState, house.basePricePerNight]);

  const onToggleExtra = (extraId: string) => {
    setExtrasState((prev) =>
      prev.map((extra) =>
        extra.extraId === extraId
          ? { ...extra, enabled: !extra.enabled }
          : extra
      )
    );
  };

  const onQtyChange = (extraId: string, value: number) => {
    setExtrasState((prev) =>
      prev.map((extra) =>
        extra.extraId === extraId
          ? {
              ...extra,
              qty: Math.max(1, value),
              enabled: value > extra.qty ? true : extra.enabled,
            }
          : extra
      )
    );
  };

  const handleDayClick = (date: Date) => {
    const normalized = toUtcDate(date);
    if (isDateBlocked(normalized)) return;

    if (!range || (range.from && range.to)) {
      setError(null);
      setRange({ from: normalized });
      return;
    }

    const from = range.from ? toUtcDate(range.from) : undefined;
    if (!from) {
      setError(null);
      setRange({ from: normalized });
      return;
    }

    if (normalized <= from) {
      setError(null);
      setRange({ from: normalized });
      return;
    }

    if (!isRangeAvailable(from, normalized)) {
      setError("Диапазон содержит занятые даты.");
      return;
    }

    setError(null);
    setRange({ from, to: normalized });
    setOpenPicker(false);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!range?.from || !range?.to || !guestName || !phone) {
      setError("Заполните даты, имя и телефон.");
      return;
    }

    if (hasConflict) {
      setError("Выбранные даты уже заняты. Попробуйте другие.");
      return;
    }

    setLoading(true);
    try {
      const selectedExtras = extrasState
        .filter((extra) => extra.enabled)
        .map((extra) => ({ extraId: extra.extraId, qty: extra.qty }));

      const response = await fetch("/api/booking/create-hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          houseId: house.id,
          startDate,
          endDate,
          extras: selectedExtras,
          guestName,
          phone,
          email: email || null,
          comment: comment || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || "Не удалось создать бронь.");
        return;
      }

      router.push(`/checkout/${data.booking.id}`);
    } catch {
      setError("Ошибка сети. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`glass-panel ${styles.root}`}>
      <div className={styles.section}>
        <div className={styles.headerRow}>
          <div>
            <div className={styles.hint}>Выбранные даты</div>
            <div className={styles.badgeRow}>
              <button type="button" className="button-primary" onClick={() => setOpenPicker(true)}>
                {startDate ? `${startDate} — ${endDate || "выберите выезд"}` : "Выберите даты"}
              </button>
              {range ? (
                <button
                  type="button"
                  className="button-secondary text-xs"
                  onClick={() => setRange(undefined)}
                >
                  Сбросить
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {openPicker ? (
          <div className={`${styles.pickerPanel}`} ref={pickerRef}>
            <DayPicker
              mode="range"
              selected={range}
              onDayClick={handleDayClick}
              numberOfMonths={1}
              fromDate={todayUtc}
              disabled={(date) => {
                if (!range?.from) return isDateBlocked(date);
                const normalized = toUtcDate(date);
                if (isDateBlocked(normalized)) return true;
                return normalized <= range.from || !isRangeAvailable(range.from, normalized);
              }}
              pagedNavigation
              locale={ru}
              modifiers={{ blocked: (date) => isDateBlocked(date) }}
              modifiersClassNames={{ blocked: "rdp-day_blocked" }}
              className="rdp"
              weekStartsOn={1}
            />
          </div>
        ) : null}

        {availabilityError ? <p className={styles.error}>{availabilityError}</p> : null}
        {hasConflict ? (
          <p className={styles.error}>Выбранные даты пересекаются с занятыми.</p>
        ) : null}
      </div>

      <div className={styles.extras}>
        <h4 className="text-lg font-semibold font-display">Дополнительные услуги</h4>
        <div className={styles.extrasList}>
          {extrasState.map((extra) => (
            <div key={extra.extraId} className={styles.extraRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.switch}
                  checked={extra.enabled}
                  onChange={() => onToggleExtra(extra.extraId)}
                />
                <span>
                  {extra.title} · {extra.price} ₽ {extra.priceType === "PER_NIGHT" ? "/ ночь" : ""}
                </span>
              </label>
              {extra.priceType === "PER_UNIT" ? (
                <div className={styles.qtyControls}>
                  <button
                    type="button"
                    className={styles.qtyButton}
                    onClick={() => onQtyChange(extra.extraId, Math.max(1, extra.qty - 1))}
                    disabled={extra.qty <= 1}
                    aria-label={`Уменьшить количество для ${extra.title}`}
                  >
                    −
                  </button>
                  <span className={styles.qtyValue}>{extra.qty}</span>
                  <button
                    type="button"
                    className={styles.qtyButton}
                    onClick={() => onQtyChange(extra.extraId, extra.qty + 1)}
                    aria-label={`Увеличить количество для ${extra.title}`}
                  >
                    +
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Имя</span>
          <input
            type="text"
            className="input-base"
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Телефон</span>
          <IMaskInput
            mask={phoneMask}
            type="tel"
            className="input-base"
            value={phone}
            onAccept={(value) => setPhone(String(value))}
            placeholder={phonePlaceholder}
            inputMode="tel"
            autoComplete="tel"
            prepare={phonePrepare}
          />
        </label>
        <label className={styles.field}>
          <span>Email (опционально)</span>
          <input
            type="email"
            className="input-base"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Комментарий</span>
          <input
            type="text"
            className="input-base"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </label>
      </div>

      <div className={styles.summary}>
        <div>
          <div className={styles.hint}>{nights ? `${nights} ночей` : "Выберите даты"}</div>
          <div className="text-xl font-semibold">{totalPrice} ₽</div>
          <div className={styles.summaryNote}>
            Базовая стоимость + допы: {extrasTotal} ₽
          </div>
        </div>
        {error ? <div className={styles.error}>{error}</div> : null}
        <button className="button-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Создаем бронь..." : "Забронировать и оплатить"}
        </button>
      </div>
    </div>
  );
}
