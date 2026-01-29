# Посуточная аренда домов (Next.js + Postgres + T-Bank)

MVP для посуточной аренды: каталог домов и допов, подбор дат, создание бронирования, оплата через T-Bank, webhook обработка.

## Стек
- Node 22+
- Next.js (App Router) + TypeScript
- Postgres (локально)
- Prisma ORM
- T-Bank API `/v2/Init` + webhook

## Быстрый старт

1) Установите зависимости
```bash
npm install
```

2) Настройте переменные окружения
```bash
cp .env.example .env.local
```

3) Запустите Postgres (Docker опционально)
```bash
npm run db:up
```

4) Примените миграции и наполните данными
```bash
npm run db:migrate
npm run db:seed
```

5) Запустите приложение
```bash
npm run dev
```

Откройте `http://localhost:3000`.

## Скрипты
- `npm run dev` — запуск Next.js
- `npm run db:up` — Postgres через Docker Compose
- `npm run db:migrate` — миграции Prisma
- `npm run db:seed` — сиды (5 домов + 3 допа)

## Переменные окружения
Смотрите `.env.example`.

- `DATABASE_URL` — подключение к Postgres
- `PUBLIC_BASE_URL` — базовый URL для callback/payments
- `TBANK_TERMINAL_KEY` — терминал ключ
- `TBANK_PASSWORD` — пароль
- `TBANK_INIT_URL` — URL для `/v2/Init`

## Платежи и webhook локально

### Вариант 1: ngrok
1) Запустите `ngrok http 3000`
2) Укажите `PUBLIC_BASE_URL` равным ngrok URL
3) Обновите `.env.local` и перезапустите сервер

### Вариант 2: ручной вызов webhook
Отправьте POST на `http://localhost:3000/api/tbank/notify` с корректной подписью Token.

Для формирования `Token` используйте правила T-Bank:
- исключите поле `Token`
- добавьте `Password`
- отсортируйте ключи по алфавиту
- склейте значения и посчитайте SHA-256

## Основные эндпоинты API
- `GET /api/meta`
- `GET /api/availability?houseId&from&to`
- `GET /api/available-houses?start&end`
- `POST /api/booking/create-hold`
- `POST /api/tbank/init`
- `POST /api/tbank/notify`

## Страницы
- `/` — главная
- `/search?start&end` — доступные дома
- `/houses/[slug]` — страница дома
- `/checkout/[bookingId]` — оплата
- `/success` и `/fail` — результаты оплаты
