/**
 * Shared address helpers for MX vs US shipping.
 */

export type ShippingCountryCode = "MX" | "US";

/** Mexico: exactly 5 digits. */
export const MX_POSTAL_RE = /^\d{5}$/;
/** US: ZIP (12345) or ZIP+4 (12345-6789). */
export const US_POSTAL_RE = /^\d{5}(-\d{4})?$/;

export function normalizeShippingCountry(
  value: unknown,
): ShippingCountryCode {
  return String(value || "MX").toUpperCase() === "US" ? "US" : "MX";
}

export function normalizePostalCode(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "");
}

export function isValidPostalCode(
  country: ShippingCountryCode | "" | null | undefined,
  postalCode: unknown,
): boolean {
  const code = normalizePostalCode(postalCode);
  if (!code) return false;
  return normalizeShippingCountry(country) === "US"
    ? US_POSTAL_RE.test(code)
    : MX_POSTAL_RE.test(code);
}

export function postalCodeErrorMessage(
  country: ShippingCountryCode | "" | null | undefined,
): string {
  return normalizeShippingCountry(country) === "US"
    ? "ZIP inválido (12345 o 12345-6789)"
    : "Código postal de 5 dígitos";
}

export function postalCodeLabel(
  country: ShippingCountryCode | "" | null | undefined,
): string {
  return normalizeShippingCountry(country) === "US"
    ? "ZIP"
    : "Código Postal";
}

export function postalCodePlaceholder(
  country: ShippingCountryCode | "" | null | undefined,
): string {
  return normalizeShippingCountry(country) === "US" ? "78701" : "03100";
}

export function postalCodeMaxLength(
  country: ShippingCountryCode | "" | null | undefined,
): number {
  return normalizeShippingCountry(country) === "US" ? 10 : 5;
}

/** Normalize US state code to uppercase 2-letter (or null). */
export function normalizeUsStateCode(value: unknown): string | null {
  const code = String(value ?? "")
    .trim()
    .toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}
