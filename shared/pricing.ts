/**
 * Shared pricing constants for MX vs US shipping.
 * Always charge in MXN. USD is display-only at a fixed rate (shown when country === US).
 */

export const FX_MXN_PER_USD = 20;
/** Monthly US international shipping / migration fee (MXN). */
export const US_INTL_FEE_MXN = 650;

export type ShippingCountry = "MX" | "US";

export function mxnToApproxUsd(mxn: number): number {
  return Math.round((mxn / FX_MXN_PER_USD) * 100) / 100;
}

export function formatApproxUsd(mxn: number): string {
  return mxnToApproxUsd(mxn).toFixed(2);
}

export function formatMxn(mxn: number): string {
  return Number(mxn).toLocaleString("es-MX", {
    maximumFractionDigits: 0,
  });
}

/** US monthly total for a plan (DB price_mxn_us, or base + fee fallback). */
export function resolveUsPlanTotalMxn(
  basePriceMxn: number,
  usTotalMxn?: number | null,
): number {
  if (usTotalMxn != null && Number(usTotalMxn) > 0) return Number(usTotalMxn);
  return Number(basePriceMxn) + US_INTL_FEE_MXN;
}

export type DisplayPricing = {
  isUS: boolean;
  /** Charge amount in MXN (what Stripe bills). */
  chargeMxn: number;
  /** Primary amount for UI (USD when US, MXN when MX). */
  primaryAmount: number;
  primaryCurrency: "USD" | "MXN";
  /** Secondary line (MXN charge when US; null when MX). */
  secondaryMxn: number | null;
  baseMxn: number;
  intlFeeMxn: number;
  baseUsd: number | null;
  feeUsd: number | null;
  totalUsd: number | null;
};

/**
 * Resolve what the wizard should show.
 * - MX / unset → MXN only (no US/USD lines)
 * - US → USD primary, MXN charge as secondary (Stripe still bills MXN)
 */
export function resolveDisplayPricing(
  basePriceMxn: number,
  country: ShippingCountry | "" | null | undefined,
  usTotalMxn?: number | null,
): DisplayPricing {
  const isUS = country === "US";
  const base = Number(basePriceMxn) || 0;
  if (!isUS) {
    return {
      isUS: false,
      chargeMxn: base,
      primaryAmount: base,
      primaryCurrency: "MXN",
      secondaryMxn: null,
      baseMxn: base,
      intlFeeMxn: 0,
      baseUsd: null,
      feeUsd: null,
      totalUsd: null,
    };
  }
  const totalMxn = resolveUsPlanTotalMxn(base, usTotalMxn);
  const intlFeeMxn = Math.max(0, totalMxn - base);
  return {
    isUS: true,
    chargeMxn: totalMxn,
    primaryAmount: mxnToApproxUsd(totalMxn),
    primaryCurrency: "USD",
    secondaryMxn: totalMxn,
    baseMxn: base,
    intlFeeMxn,
    baseUsd: mxnToApproxUsd(base),
    feeUsd: mxnToApproxUsd(intlFeeMxn),
    totalUsd: mxnToApproxUsd(totalMxn),
  };
}

/** Charge math helper (Stripe amounts). Prefer resolveDisplayPricing for UI. */
export function resolveCheckoutPricing(
  basePriceMxn: number,
  country: ShippingCountry | "" | null,
  usTotalMxn?: number | null,
) {
  const d = resolveDisplayPricing(basePriceMxn, country, usTotalMxn);
  return {
    country: d.isUS ? ("US" as const) : ("MX" as const),
    basePriceMxn: d.baseMxn,
    intlFeeMxn: d.intlFeeMxn,
    totalMxn: d.chargeMxn,
    approxUsd: d.totalUsd,
    baseApproxUsd: d.baseUsd,
    feeApproxUsd: d.feeUsd,
  };
}
