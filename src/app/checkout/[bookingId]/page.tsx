import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/dates";
import { PayButton } from "@/components/PayButton";
import styles from "./CheckoutPage.module.css";

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  params: Promise<{ bookingId: string }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { bookingId } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { house: true },
  });

  if (!booking) {
    notFound();
  }

  const formatBookingDate = (value: Date) =>
    new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(value);

  const statusLabels: Record<string, string> = {
    HOLD: "Бронь удерживается",
    PENDING_PAYMENT: "Ожидается оплата",
    PAID: "Оплачено",
    CANCELLED: "Отменено",
    MANUAL: "Подтверждено вручную",
  };

  const holdExpired =
    booking.status === "HOLD" && (!booking.holdUntil || booking.holdUntil <= new Date());
  const statusLabel = holdExpired
    ? "Холд истек"
    : statusLabels[booking.status] ?? booking.status;
  const searchQuery = `?start=${formatDate(booking.startDate)}&end=${formatDate(
    booking.endDate
  )}`;

  const images = Array.isArray(booking.house.images)
    ? booking.house.images.filter((image): image is string => typeof image === "string")
    : [];
  const heroImage = images[0] ?? "/default.webp";

  const extrasSelection = Array.isArray(booking.extras)
    ? booking.extras.filter(
      (extra): extra is { extraId: string; qty: number } =>
        typeof extra === "object" && extra !== null && "extraId" in extra && "qty" in extra
    )
    : [];

  const extras = extrasSelection.length
    ? await prisma.extra.findMany({
      where: { id: { in: extrasSelection.map((extra) => extra.extraId) } },
      select: { id: true, title: true },
    })
    : [];

  const extrasWithTitles = extrasSelection.map((extra) => ({
    ...extra,
    title: extras.find((option) => option.id === extra.extraId)?.title ?? "Доп. услуга",
  }));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Проверьте бронь</h1>
        <div className={styles.houseRow}>
          <Image
            src={heroImage}
            alt={booking.house.title}
            width={320}
            height={220}
            className={styles.houseImage}
            sizes="112px"
            priority
          />
          <p className={styles.houseTitle}>{booking.house.title}</p>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.metaRow}>
          <span>Заезд: {formatBookingDate(booking.startDate)}</span>
          <span>Выезд: {formatBookingDate(booking.endDate)}</span>
          <span>Ночей: {booking.nights}</span>
        </div>
        <div className={styles.details}>
          <p>Имя: {booking.guestName}</p>
          <p>Телефон: {booking.phone}</p>
          {booking.email ? <p>Email: {booking.email}</p> : null}
          {booking.comment ? <p>Комментарий: {booking.comment}</p> : null}
        </div>
        {extrasWithTitles.length ? (
          <div className={styles.extras}>
            <div className={styles.extrasTitle}>Дополнительные услуги</div>
            <div className={styles.extrasList}>
              {extrasWithTitles.map((extra) => (
                <span key={extra.extraId} className={styles.badge}>
                  {extra.title} × {extra.qty}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        <div className={styles.total}>Итого: {booking.totalPrice} ₽</div>
      </div>

      <div>
        <div style={{marginBottom: '1rem'}}>Бронь удерживается 10 минут.</div>
        {holdExpired ? (
          <div className={styles.expired}>
            <div className={styles.expiredText}>
              Время удержания истекло. Пожалуйста, выберите даты заново.
            </div>
            <div>
              <Link href={`/search${searchQuery}`} className={styles.secondaryButton}>
                Вернуться к поиску
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <PayButton bookingId={booking.id} />
          </div>
        )}
      </div>
      <div>
        <Link href={`/houses/${booking.house.slug}`} className={styles.secondaryButton}>
          Вернуться к дому
        </Link>
      </div>

    </div>
  );
}
