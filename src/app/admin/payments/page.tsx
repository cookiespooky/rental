"use client";

import { useEffect, useState } from "react";

type Payment = {
  id: string;
  amount: number;
  status: string;
  paymentUrl: string | null;
  tbankPaymentId: string | null;
  booking: { id: string; house: { title: string } };
  createdAt: string;
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const response = await fetch("/api/admin/payments");
    const data = await response.json();
    setPayments(data.payments ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const updatePayment = async (id: string, payload: Partial<Payment>) => {
    setError(null);
    const response = await fetch(`/api/admin/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data?.error || "Не удалось обновить платеж.");
      return;
    }
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6">
        <h2 className="text-2xl font-semibold font-display">Платежи</h2>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="mt-4 space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="grid gap-2 border-b border-[#e1e5df] pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{payment.booking?.house?.title}</p>
                  <p className="text-xs text-[#5a6761]">{payment.booking?.id}</p>
                </div>
                <div className="text-sm">{payment.amount} коп.</div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <label className="space-y-1 text-xs">
                  <span>Статус</span>
                  <input
                    className="input-base"
                    value={payment.status}
                    onChange={(event) =>
                      updatePayment(payment.id, { status: event.target.value })
                    }
                  />
                </label>
                <label className="space-y-1 text-xs">
                  <span>TBank PaymentId</span>
                  <input
                    className="input-base"
                    value={payment.tbankPaymentId ?? ""}
                    onChange={(event) =>
                      updatePayment(payment.id, { tbankPaymentId: event.target.value })
                    }
                  />
                </label>
                <label className="space-y-1 text-xs">
                  <span>Payment URL</span>
                  <input
                    className="input-base"
                    value={payment.paymentUrl ?? ""}
                    onChange={(event) =>
                      updatePayment(payment.id, { paymentUrl: event.target.value })
                    }
                  />
                </label>
                <label className="space-y-1 text-xs">
                  <span>Amount</span>
                  <input
                    className="input-base"
                    value={payment.amount}
                    onChange={(event) =>
                      updatePayment(payment.id, { amount: Number(event.target.value) })
                    }
                  />
                </label>
              </div>
              <div className="text-xs text-[#5a6761]">
                Создано: {new Date(payment.createdAt).toLocaleString("ru-RU")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
