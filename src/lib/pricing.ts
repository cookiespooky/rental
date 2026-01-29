import type { ExtraPriceType } from "@prisma/client";

export type SelectedExtra = { extraId: string; qty: number };

export type ExtraOption = {
  id: string;
  price: number;
  priceType: ExtraPriceType;
};

export function calculateExtrasTotal(
  extras: SelectedExtra[],
  options: ExtraOption[],
  nights: number
): number {
  const optionMap = new Map(options.map((extra) => [extra.id, extra]));
  return extras.reduce((total, item) => {
    const option = optionMap.get(item.extraId);
    if (!option) return total;
    if (option.priceType === "PER_BOOKING") {
      return total + option.price;
    }
    if (option.priceType === "PER_NIGHT") {
      return total + option.price * nights;
    }
    if (option.priceType === "PER_UNIT") {
      return total + option.price * item.qty;
    }
    return total;
  }, 0);
}
