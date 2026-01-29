"use client";

import { useEffect, useMemo, useState } from "react";

type House = {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: unknown;
  basePricePerNight: number;
  maxGuests: number;
  active: boolean;
};

type HouseForm = {
  title: string;
  slug: string;
  description: string;
  images: string[];
  basePricePerNight: number;
  maxGuests: number;
  active: boolean;
};

const emptyForm: HouseForm = {
  title: "",
  slug: "",
  description: "",
  images: [],
  basePricePerNight: 0,
  maxGuests: 1,
  active: true,
};

export default function AdminHousesPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [form, setForm] = useState<HouseForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const imagesPreview = useMemo(() => form.images, [form.images]);

  const moveImage = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    setForm((prev) => {
      const next = [...prev.images];
      const [picked] = next.splice(from, 1);
      next.splice(to, 0, picked);
      return { ...prev, images: next };
    });
  };

  const load = async () => {
    const response = await fetch("/api/admin/houses");
    const data = await response.json();
    setHouses(data.houses ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || "Не удалось загрузить файл.");
        return;
      }
      setForm((prev) => ({ ...prev, images: [...prev.images, data.url] }));
    } catch {
      setError("Не удалось загрузить файл.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        editingId ? `/api/admin/houses/${editingId}` : "/api/admin/houses",
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

  const handleEdit = (house: House) => {
    setEditingId(house.id);
    setForm({
      title: house.title,
      slug: house.slug,
      description: house.description,
      images: Array.isArray(house.images) ? (house.images as string[]) : [],
      basePricePerNight: house.basePricePerNight,
      maxGuests: house.maxGuests,
      active: house.active,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить дом?")) return;
    await fetch(`/api/admin/houses/${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold font-display">
            {editingId ? "Редактировать дом" : "Новый дом"}
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
          <label className="space-y-2 text-sm md:col-span-2">
            <span>Описание</span>
            <textarea
              className="input-base min-h-110"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Цена за ночь</span>
            <input
              type="number"
              className="input-base"
              value={form.basePricePerNight}
              onChange={(event) =>
                setForm({ ...form, basePricePerNight: Number(event.target.value) })
              }
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Макс. гостей</span>
            <input
              type="number"
              className="input-base"
              value={form.maxGuests}
              onChange={(event) => setForm({ ...form, maxGuests: Number(event.target.value) })}
            />
          </label>
          <label className="space-y-2 text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => setForm({ ...form, active: event.target.checked })}
            />
            <span>Активен</span>
          </label>
          <div className="space-y-2 text-sm md:col-span-2">
            <label htmlFor="house-images-upload">Загрузить фото</label>
            <input
              id="house-images-upload"
              type="file"
              accept="image/*"
              className="input-base"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
            {uploading ? <p className="text-xs">Загрузка...</p> : null}
            <div className="flex flex-wrap gap-2">
              {imagesPreview.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="relative group"
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragEnd={() => setDragIndex(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (dragIndex === null) return;
                    moveImage(dragIndex, index);
                    setDragIndex(null);
                  }}
                  title="Перетащите, чтобы изменить порядок"
                >
                  <img
                    src={url}
                    alt=""
                    className="h-20 w-28 rounded-xl object-cover ring-1 ring-transparent group-hover:ring-[#d7ddd6]"
                  />
                  {index === 0 ? (
                    <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px]">
                      Главное
                    </span>
                  ) : null}
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-white rounded-full px-2 text-xs"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setForm((prev) => ({
                        ...prev,
                        images: prev.images.filter((item) => item !== url),
                      }));
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="button-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Сохраняем..." : "Сохранить"}
        </button>
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <h3 className="text-xl font-semibold font-display">Все дома</h3>
        <div className="mt-4 space-y-3">
          {houses.map((house) => (
            <div
              key={house.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e1e5df] pb-3"
            >
              <div>
                <p className="font-semibold">{house.title}</p>
                <p className="text-xs text-[#5a6761]">{house.slug}</p>
              </div>
              <div className="text-sm">{house.basePricePerNight} ₽ / ночь</div>
              <div className="text-xs">{house.active ? "Активен" : "Скрыт"}</div>
              <div className="flex gap-2">
                <button
                  className="button-secondary text-xs"
                  onClick={() => handleEdit(house)}
                >
                  Редактировать
                </button>
                <button
                  className="button-secondary text-xs"
                  onClick={() => handleDelete(house.id)}
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
