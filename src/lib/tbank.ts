import crypto from "node:crypto";

type TBankPayload = Record<string, string | number | null | undefined>;

export function buildTbankToken(payload: TBankPayload, password: string): string {
  const entries = Object.entries({ ...payload, Password: password })
    .filter(([key, value]) => key !== "Token" && value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b));

  const tokenSource = entries.map(([, value]) => String(value)).join("");

  return crypto.createHash("sha256").update(tokenSource).digest("hex");
}

export function resolveTbankStatus(status: string): "PAID" | "CANCELLED" | "PENDING" {
  const normalized = status.toUpperCase();
  if (normalized === "CONFIRMED" || normalized === "AUTHORIZED") {
    return "PAID";
  }
  if (["CANCELLED", "REJECTED", "REVERSED", "REFUNDED"].includes(normalized)) {
    return "CANCELLED";
  }
  return "PENDING";
}
