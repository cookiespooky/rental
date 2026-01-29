"use client";

import { useEffect, useState } from "react";
import type { ExtraPriceType } from "@prisma/client";

type Extra = {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceType: ExtraPriceType;
  active: boolean;
};

type ExtraForm = {
  title: string;
  slug: string;
  price: number;
  priceType: ExtraPriceType;
  active: boolean;
};

const emptyForm: ExtraForm = {
  title: "",
  slug: "",
  price: 0,
  priceType: "PER_BOOKING",
  active: true,
};

export default function AdminExtrasPage() {
  const [extras, setExtras] = useState<Extra[]>([]);
  const [form, setForm] = useState<ExtraForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const response = await fetch("/api/admin/extras");
    const data = await response.json();
    setExtras(data.extras ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        editingId ? `/api/admin/extras/${editingId}` : "/api/admin/extras",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || "Ошибка сохранения.");
        return;
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch {
      setError("Ошибка сохранения.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (extra: Extra) => {
    setEditingId(extra.id);
    setForm({
      title: extra.title,
      slug: extra.slug,
      price: extra.price,
      priceType: extra.priceType,
      active: extra.active,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить доп?")) return;
    await fetch(`/api/admin/extras/${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold font-display">
            {editingId ? "Редактировать доп" : "Новый доп"}
          </h2>
          {editingId ? (
            <button
              className="button-secondary text-xs"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Отмена
            </button>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span>Название</span>
            <input
              className="input-base"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Slug</span>
            <input
              className="input-base"
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Цена</span>
            <input
              type="number"
              className="input-base"
              value={form.price}
              onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Тип цены</span>
            <select
              className="input-base"
              value={form.priceType}
              onChange={(event) =>
                setForm({ ...form, priceType: event.target.value as ExtraPriceType })
              }
            >
              <option value="PER_BOOKING">PER_BOOKING</option>
              <option value="PER_NIGHT">PER_NIGHT</option>
              <option value="PER_UNIT">PER_UNIT</option>
            </select>
          </label>
          <label className="space-y-2 text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => setForm({ ...form, active: event.target.checked })}
            />
            <span>Активен</span>
          </label>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="button-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Сохраняем..." : "Сохранить"}
        </button>
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <h3 className="text-xl font-semibold font-display">Все допы</h3>
        <div className="mt-4 space-y-3">
          {extras.map((extra) => (
            <div
              key={extra.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e1e5df] pb-3"
            >
              <div>
                <p className="font-semibold">{extra.title}</p>
                <p className="text-xs text-[#5a6761]">{extra.slug}</p>
              </div>
              <div className="text-sm">{extra.price} ₽</div>
              <div className="text-xs">{extra.priceType}</div>
              <div className="text-xs">{extra.active ? "Активен" : "Скрыт"}</div>
              <div className="flex gap-2">
                <button
                  className="button-secondary text-xs"
                  onClick={() => handleEdit(extra)}
                >
                  Редактировать
                </button>
                <button
                  className="button-secondary text-xs"
                  onClick={() => handleDelete(extra.id)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
