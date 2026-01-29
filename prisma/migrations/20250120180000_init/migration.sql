-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('HOLD', 'PENDING_PAYMENT', 'PAID', 'CANCELLED', 'MANUAL');

-- CreateEnum
CREATE TYPE "ExtraPriceType" AS ENUM ('PER_BOOKING', 'PER_NIGHT', 'PER_UNIT');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('TBANK');

-- CreateTable
CREATE TABLE "House" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" JSONB NOT NULL,
    "basePricePerNight" INTEGER NOT NULL,
    "maxGuests" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "House_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extra" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "priceType" "ExtraPriceType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Extra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" UUID NOT NULL,
    "houseId" UUID NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "status" "BookingStatus" NOT NULL,
    "holdUntil" TIMESTAMPTZ(6),
    "guestName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "comment" TEXT,
    "extras" JSONB,
    "nights" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'TBANK',
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "tbankPaymentId" TEXT,
    "paymentUrl" TEXT,
    "rawInit" JSONB,
    "rawWebhook" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "House_slug_key" ON "House"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Extra_slug_key" ON "Extra"("slug");

-- CreateIndex
CREATE INDEX "Booking_houseId_startDate_endDate_idx" ON "Booking"("houseId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_bookingId_key" ON "Payment"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_tbankPaymentId_key" ON "Payment"("tbankPaymentId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
