import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#eef2ed]">
      <div className="container-shell space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[#5a6761]">Админ-панель</p>
            <h1 className="text-3xl font-semibold font-display">Управление арендами</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            <Link href="/admin" className="button-secondary text-sm">
              Обзор
            </Link>
            <Link href="/admin/houses" className="button-secondary text-sm">
              Дома
            </Link>
            <Link href="/admin/extras" className="button-secondary text-sm">
              Допы
            </Link>
            <Link href="/admin/bookings" className="button-secondary text-sm">
              Брони
            </Link>
            <Link href="/admin/payments" className="button-secondary text-sm">
              Платежи
            </Link>
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
