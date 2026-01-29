/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const houses = [
  {
    title: "Сосновый приют",
    slug: "sosnovyy-priyut",
    description: "Уютный дом среди сосен с панорамной верандой и камином.",
    images: [
      "https://placehold.co/800x600?text=Sosnovyy",
      "https://placehold.co/800x600?text=Veranda",
    ],
    basePricePerNight: 8500,
    maxGuests: 4,
  },
  {
    title: "Лесная веранда",
    slug: "lesnaya-veranda",
    description: "Дом у леса с зоной барбекю и отдельной спальней.",
    images: [
      "https://placehold.co/800x600?text=Lesnaya",
      "https://placehold.co/800x600?text=BBQ",
    ],
    basePricePerNight: 9200,
    maxGuests: 5,
  },
  {
    title: "Озерный горизонт",
    slug: "ozernyy-gorizont",
    description: "Просторный дом с видом на воду и собственным пирсом.",
    images: [
      "https://placehold.co/800x600?text=Ozero",
      "https://placehold.co/800x600?text=Pier",
    ],
    basePricePerNight: 12000,
    maxGuests: 6,
  },
  {
    title: "Скандинавский свет",
    slug: "skandinavskiy-svet",
    description: "Светлый интерьер, минимализм и много воздуха.",
    images: [
      "https://placehold.co/800x600?text=Scandi",
      "https://placehold.co/800x600?text=Light",
    ],
    basePricePerNight: 7800,
    maxGuests: 4,
  },
  {
    title: "Горный утес",
    slug: "gornyy-utes",
    description: "Дом с террасой и видом на холмы, идеален для перезагрузки.",
    images: [
      "https://placehold.co/800x600?text=Gornyy",
      "https://placehold.co/800x600?text=Terrace",
    ],
    basePricePerNight: 10500,
    maxGuests: 5,
  },
];

const extras = [
  {
    title: "Баня",
    slug: "banya",
    price: 3500,
    priceType: "PER_BOOKING",
  },
  {
    title: "Чан",
    slug: "chan",
    price: 2000,
    priceType: "PER_NIGHT",
  },
  {
    title: "Снегоходы",
    slug: "snegohody",
    price: 2500,
    priceType: "PER_UNIT",
  },
];

async function main() {
  for (const house of houses) {
    await prisma.house.upsert({
      where: { slug: house.slug },
      update: {
        title: house.title,
        description: house.description,
        images: house.images,
        basePricePerNight: house.basePricePerNight,
        maxGuests: house.maxGuests,
        active: true,
      },
      create: {
        ...house,
        active: true,
      },
    });
  }

  for (const extra of extras) {
    await prisma.extra.upsert({
      where: { slug: extra.slug },
      update: {
        title: extra.title,
        price: extra.price,
        priceType: extra.priceType,
        active: true,
      },
      create: {
        ...extra,
        active: true,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
