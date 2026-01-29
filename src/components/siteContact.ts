export const brandName = "Барская усадьба";
export const phoneLabel = "+7 (900) 123-45-67";
export const phoneHref = "tel:+79001234567";
export const ctaLabel = "Оставить заявку";
export const phoneMask = "+{7} (000) 000-00-00";
export const phonePlaceholder = "+7 (___) ___-__-__";

export const phonePrepare = (value: string, masked?: { unmaskedValue?: string }) => {
  const digits = value.replace(/\D/g, "");
  if (masked?.unmaskedValue?.length === 0 && digits.startsWith("8")) {
    return digits.slice(1);
  }
  return digits;
};
