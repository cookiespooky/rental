"use client";

import { useEffect, useState } from "react";
import type { BookingStatus } from "@prisma/client";

type Booking = {
  id: string;
  house: { title: string };
  startDate: string;
  endDate: string;
  status: BookingStatus;
  holdUntil: string | null;
  totalPrice: number;
  guestName: string;
  phone: string;
  email: string | null;
  createdAt: string;
};

const statusOptions: BookingStatus[] = [
  "HOLD",
  "PENDING_PAYMENT",
  "PAID",
  "CANCELLED",
  "MANUAL",
];

const statusLabels: Record<BookingStatus, string> = {
  HOLD: "Бронь удерживается",
  PENDING_PAYMENT: "Ожидается оплата",
  PAID: "Оплачено",
  CANCELLED: "Отменено",
  MANUAL: "Подтверждено вручную",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const response = await fetch("/api/admin/bookings");
    const data = await response.json();
    setBookings(data.bookings ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: BookingStatus) => {
    setError(null);
    const response = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data?.error || "Не удалось обновить статус.");
      return;
    }
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6">
        <h2 className="text-2xl font-semibold font-display">Брони</h2>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="mt-4 space-y-3">
          {bookings.map((booking) => {
            const holdExpired =
              booking.status === "HOLD" &&
              (!booking.holdUntil || new Date(booking.holdUntil) <= new Date());
            const statusLabel = holdExpired
              ? "Холд истек"
              : statusLabels[booking.status] ?? booking.status;
            return (
            <div
              key={booking.id}
              className="grid gap-2 border-b border-[#e1e5df] pb-3 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{booking.house?.title}</p>
                  <p className="text-xs text-[#5a6761]">{booking.id}</p>
                </div>
                <div>{booking.totalPrice} ₽</div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-[#5a6761]">
                <span>Заезд: {booking.startDate.slice(0, 10)}</span>
                <span>Выезд: {booking.endDate.slice(0, 10)}</span>
                <span>{booking.guestName}</span>
                <span>{booking.phone}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  className="input-base max-w-220"
                  value={booking.status}
                  onChange={(event) =>
                    updateStatus(booking.id, event.target.value as BookingStatus)
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-[#5a6761]">Статус: {statusLabel}</span>
                <span className="text-xs text-[#5a6761]">
                  Создано: {new Date(booking.createdAt).toLocaleString("ru-RU")}
                </span>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
