import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HouseCard } from "@/components/HouseCard";
import { HomeSearchPicker } from "@/components/HomeSearchPicker";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [houses, extras] = await Promise.all([
    prisma.house.findMany({
      where: { active: true },
      orderBy: { title: "asc" },
    }),
    prisma.extra.findMany({
      where: { active: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="container-shell">
      <header>
        <div className="hero">
          <span className="badge">Посуточная аренда домов</span>
          <h1 className="text-4xl md:text-5xl font-semibold font-display">
            Тишина леса, уютный свет, приватный отдых для вашего ритма.
          </h1>
          <p className="text-base text-[#3f4b45]">
            Выберите дом, отметьте даты и допы
          </p>
          {/*}
          <div className="flex flex-wrap gap-3">
            <Link href="#houses" className="button-primary">
              Смотреть дома
            </Link>
            <Link href="#extras" className="button-secondary">
              Дополнительные услуги
            </Link>
          </div>*/}
        </div>
      </header>

      <HomeSearchPicker />

      <section id="houses" className="space-y-6">
        <div className="card-grid">
          {houses.map((house) => (
            <HouseCard key={house.id} house={house} href={`/houses/${house.slug}`} />
          ))}
        </div>
      </section>

      <section id="extras" className="space-y-5">
        <h2 className="text-3xl font-semibold font-display">Дополнительные услуги</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {extras.map((extra) => (
            <div key={extra.id} className="glass-panel rounded-3xl p-5 space-y-2">
              <h3 className="text-xl font-semibold font-display">{extra.title}</h3>
              <p className="text-sm text-[#3f4b45]">
                {extra.price} ₽ {extra.priceType === "PER_NIGHT" ? "за ночь" : extra.priceType === "PER_UNIT" ? "за штуку" : "за бронирование"}
              </p>
              {/*
              <span className="badge">{extra.priceType.replace("_", " ")}</span>
              */}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
