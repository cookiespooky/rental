"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import { ru } from "date-fns/locale";
import { formatDate, parseDateInput } from "@/lib/dates";
import styles from "./HomeSearchPicker.module.css";

export function HomeSearchPicker({
  initialStart,
  initialEnd,
  autoCloseOnComplete = false,
}: {
  initialStart?: string | null;
  initialEnd?: string | null;
  autoCloseOnComplete?: boolean;
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
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  const todayUtc = useMemo(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }, []);

  const toUtcDate = (date: Date) =>
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  useEffect(() => {
    const controller = new AbortController();
    const fetchAvailability = async () => {
      setError(null);
      try {
        const start = new Date(todayUtc);
        const end = new Date(todayUtc);
        end.setUTCDate(end.getUTCDate() + 180);

        const response = await fetch(
          `/api/calendar-availability?from=${formatDate(start)}&to=${formatDate(end)}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        if (!response.ok) {
          setError(data?.error || "Не удалось загрузить календарь.");
          return;
        }
        setAvailableDates(new Set(data.dates ?? []));
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError("Не удалось загрузить календарь.");
      }
    };

    fetchAvailability();
    return () => controller.abort();
  }, [todayUtc]);

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

  const isDateAvailable = (date: Date) => {
    const normalized = toUtcDate(date);
    if (normalized < todayUtc) return false;
    return availableDates.has(formatDate(normalized));
  };

  const isRangeAvailable = (from: Date, to: Date) => {
    const cursor = new Date(from);
    while (cursor < to) {
      if (!isDateAvailable(cursor)) return false;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return true;
  };

  const startDate = range?.from ? formatDate(range.from) : "";
  const endDate = range?.to ? formatDate(range.to) : "";

  const handleDayClick = (date: Date) => {
    const normalized = toUtcDate(date);
    if (!isDateAvailable(normalized)) return;

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
    router.push(`/search?start=${formatDate(from)}&end=${formatDate(normalized)}`);
    if (autoCloseOnComplete) {
      setOpenPicker(false);
    }
  };

  return (
    <div className={`${styles.root}`}>
      {/*<div className={styles.header}>
        <div>
          <h2 className={`font-display ${styles.title}`}>Найти свободный дом</h2>
          <p className={styles.subtitle}>
            Зеленые даты — доступны (хотя бы один дом свободен).
          </p>
        </div>
      </div>*/}

      <div className={styles.badgeRow}>
        <button type="button" className="button-primary" onClick={() => setOpenPicker(true)}>
          {startDate ? `${startDate} — ${endDate || "выберите выезд"}` : "Выбрать даты"}
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

      {openPicker ? (
        <div ref={pickerRef}>
          <DayPicker
            mode="range"
            selected={range}
            onDayClick={handleDayClick}
            numberOfMonths={1}
            fromDate={todayUtc}
            disabled={(date) => !isDateAvailable(date)}
            pagedNavigation
            locale={ru}
            modifiers={{ blocked: (date) => !isDateAvailable(date) }}
            modifiersClassNames={{ blocked: "rdp-day_blocked" }}
            className="rdp"
            weekStartsOn={1}
          />
        </div>
      ) : null}

      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
