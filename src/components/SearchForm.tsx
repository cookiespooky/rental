"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

export function SearchForm({
  initialStart,
  initialEnd,
}: {
  initialStart?: string | null;
  initialEnd?: string | null;
}) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(initialStart ?? "");
  const [endDate, setEndDate] = useState(initialEnd ?? "");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!startDate || !endDate) return;
    router.push(`/search?start=${startDate}&end=${endDate}`);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 space-y-4">
      <h2 className="text-2xl font-semibold font-display">Найти свободный дом</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span>Заезд</span>
          <input
            type="date"
            className="input-base"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            required
          />
        </label>
        <label className="space-y-2 text-sm">
          <span>Выезд</span>
          <input
            type="date"
            className="input-base"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit" className="button-primary">
        Показать свободные дома
      </button>
    </form>
  );
}
