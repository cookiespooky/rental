"use client";

import { useState } from "react";

export function PayButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tbank/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await response.json();
      if (!response.ok || !data.paymentUrl) {
        setError(data?.error || "Не удалось создать платеж.");
        return;
      }
      window.location.href = data.paymentUrl;
    } catch {
      setError("Ошибка сети. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button className="button-primary" onClick={handlePay} disabled={loading}>
        {loading ? "Переходим к оплате..." : "Оплатить"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
