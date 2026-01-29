import Link from "next/link";

export default function AdminPage() {
  const cards = [
    {
      title: "Дома",
      description: "Создавайте и редактируйте дома, управляйте ценами и фото.",
      href: "/admin/houses",
    },
    {
      title: "Допы",
      description: "Управляйте дополнительными услугами и их типом тарификации.",
      href: "/admin/extras",
    },
    {
      title: "Брони",
      description: "Следите за статусами бронирований и вручную обновляйте их.",
      href: "/admin/bookings",
    },
    {
      title: "Платежи",
      description: "Проверяйте платежи и обновляйте статусы при необходимости.",
      href: "/admin/payments",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6">
        <h2 className="text-2xl font-semibold font-display">Добро пожаловать</h2>
        <p className="text-sm text-[#5a6761]">
          Здесь можно управлять каталогом, бронированиями и платежами.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="glass-panel rounded-3xl p-5 space-y-2 admin-card"
          >
            <h3 className="text-xl font-semibold font-display">{card.title}</h3>
            <p className="text-sm text-[#5a6761]">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
