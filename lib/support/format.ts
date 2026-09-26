export function supportAmount(
  value: number,
  kind: string,
  unit: string,
  locale: string,
) {
  return kind === "money"
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EUR",
      }).format(value / 100)
    : `${value.toLocaleString(locale)} ${unit}`;
}
export function parseSupportQuantity(value: string, kind: string) {
  const clean = value.trim().replace(",", ".");
  if (kind === "money") {
    if (!/^\d{1,7}(\.\d{1,2})?$/.test(clean)) return null;
    const [whole, fraction = ""] = clean.split(".");
    const n = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
    return n > 0 && n <= 100000000 ? n : null;
  }
  if (!/^\d{1,9}$/.test(clean)) return null;
  const n = Number(clean);
  return n > 0 && n <= 100000000 ? n : null;
}
export function externalDonationUrl(value: string) {
  if (!value.trim()) return null;
  try {
    const u = new URL(value.trim());
    if (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      value.length <= 2000
    )
      return u.toString();
  } catch {}
  throw new Error("Invalid donation URL");
}
