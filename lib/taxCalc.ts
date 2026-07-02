/**
 * Income tax computation for FY 2025-26 (AY 2026-27), India.
 *
 * IMPORTANT: These slabs, rebate limits, and deduction caps are current as of
 * FY 2025-26 per the Union Budget 2025 (Finance Act, Section 115BAC for the
 * new regime). Tax rules change almost every Union Budget (typically effective
 * from the following April). Review and update the constants below each year —
 * search "income tax slabs FY <year> India" to confirm before relying on this
 * for a new financial year.
 *
 * This is a simplified estimator, not a filing tool. It does not cover every
 * income head (capital gains, business income, foreign income, etc.) or every
 * deduction. Always cross-check against the official calculator at
 * incometax.gov.in before making financial decisions.
 */

export interface TaxBreakdown {
  regime: "new" | "old";
  grossIncome: number;
  standardDeduction: number;
  otherDeductions: number;
  taxableIncome: number;
  slabTax: number;
  rebate: number;
  marginalRelief: number;
  taxAfterRebate: number;
  surcharge: number;
  cess: number;
  totalTax: number;
}

interface Slab {
  upto: number;
  rate: number;
}

const NEW_REGIME_SLABS: Slab[] = [
  { upto: 400_000, rate: 0 },
  { upto: 800_000, rate: 0.05 },
  { upto: 1_200_000, rate: 0.1 },
  { upto: 1_600_000, rate: 0.15 },
  { upto: 2_000_000, rate: 0.2 },
  { upto: 2_400_000, rate: 0.25 },
  { upto: Infinity, rate: 0.3 },
];

const OLD_REGIME_SLABS: Slab[] = [
  { upto: 250_000, rate: 0 },
  { upto: 500_000, rate: 0.05 },
  { upto: 1_000_000, rate: 0.2 },
  { upto: Infinity, rate: 0.3 },
];

function computeSlabTax(taxableIncome: number, slabs: Slab[]): number {
  let tax = 0;
  let lower = 0;
  for (const slab of slabs) {
    if (taxableIncome <= lower) break;
    const taxableInSlab = Math.min(taxableIncome, slab.upto) - lower;
    tax += taxableInSlab * slab.rate;
    lower = slab.upto;
  }
  return tax;
}

/** Simplified surcharge. Real rules differ for capital gains/dividends and
 * cap the new regime's maximum surcharge at 25% (old regime can reach 37%). */
function computeSurcharge(
  taxableIncome: number,
  taxAfterRebate: number,
  regime: "new" | "old"
): number {
  let rate = 0;
  if (taxableIncome > 20_000_000) rate = regime === "old" ? 0.37 : 0.25;
  else if (taxableIncome > 10_000_000) rate = 0.15;
  else if (taxableIncome > 5_000_000) rate = 0.1;
  return taxAfterRebate * rate;
}

export function computeNewRegime(
  grossIncome: number,
  employerNps: number = 0
): TaxBreakdown {
  const standardDeduction = grossIncome > 0 ? 75_000 : 0;
  const otherDeductions = Math.max(0, employerNps);
  const taxableIncome = Math.max(
    0,
    grossIncome - standardDeduction - otherDeductions
  );

  const slabTax = computeSlabTax(taxableIncome, NEW_REGIME_SLABS);

  const rebate = taxableIncome <= 1_200_000 ? Math.min(slabTax, 60_000) : 0;
  let taxAfterRebate = slabTax - rebate;

  // Marginal relief just above the ₹12L rebate threshold.
  let marginalRelief = 0;
  if (taxableIncome > 1_200_000) {
    const excessIncome = taxableIncome - 1_200_000;
    if (taxAfterRebate > excessIncome) {
      marginalRelief = taxAfterRebate - excessIncome;
      taxAfterRebate = excessIncome;
    }
  }

  const surcharge = computeSurcharge(taxableIncome, taxAfterRebate, "new");
  const cess = (taxAfterRebate + surcharge) * 0.04;
  const totalTax = Math.round(taxAfterRebate + surcharge + cess);

  return {
    regime: "new",
    grossIncome,
    standardDeduction,
    otherDeductions,
    taxableIncome,
    slabTax: Math.round(slabTax),
    rebate,
    marginalRelief: Math.round(marginalRelief),
    taxAfterRebate: Math.round(taxAfterRebate),
    surcharge: Math.round(surcharge),
    cess: Math.round(cess),
    totalTax,
  };
}

export interface OldRegimeInputs {
  deduction80C?: number; // capped at 1,50,000
  deduction80D?: number; // capped at 1,00,000 (simplified, ignores age tiers)
  hraExemption?: number; // pre-computed HRA exemption amount
  homeLoanInterest?: number; // capped at 2,00,000 (self-occupied)
}

export function computeOldRegime(
  grossIncome: number,
  inputs: OldRegimeInputs = {}
): TaxBreakdown {
  const standardDeduction = grossIncome > 0 ? 50_000 : 0;
  const cap80C = Math.min(Math.max(0, inputs.deduction80C ?? 0), 150_000);
  const cap80D = Math.min(Math.max(0, inputs.deduction80D ?? 0), 100_000);
  const hra = Math.max(0, inputs.hraExemption ?? 0);
  const capHomeLoan = Math.min(
    Math.max(0, inputs.homeLoanInterest ?? 0),
    200_000
  );
  const otherDeductions = cap80C + cap80D + hra + capHomeLoan;

  const taxableIncome = Math.max(
    0,
    grossIncome - standardDeduction - otherDeductions
  );

  const slabTax = computeSlabTax(taxableIncome, OLD_REGIME_SLABS);

  const rebate = taxableIncome <= 500_000 ? Math.min(slabTax, 12_500) : 0;
  let taxAfterRebate = slabTax - rebate;

  let marginalRelief = 0;
  if (taxableIncome > 500_000) {
    const excessIncome = taxableIncome - 500_000;
    if (taxAfterRebate > excessIncome && taxableIncome <= 510_000) {
      marginalRelief = taxAfterRebate - excessIncome;
      taxAfterRebate = excessIncome;
    }
  }

  const surcharge = computeSurcharge(taxableIncome, taxAfterRebate, "old");
  const cess = (taxAfterRebate + surcharge) * 0.04;
  const totalTax = Math.round(taxAfterRebate + surcharge + cess);

  return {
    regime: "old",
    grossIncome,
    standardDeduction,
    otherDeductions,
    taxableIncome,
    slabTax: Math.round(slabTax),
    rebate,
    marginalRelief: Math.round(marginalRelief),
    taxAfterRebate: Math.round(taxAfterRebate),
    surcharge: Math.round(surcharge),
    cess: Math.round(cess),
    totalTax,
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
