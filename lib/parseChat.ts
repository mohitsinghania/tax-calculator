import { IncomeFormState } from "@/lib/taxFields";

export interface ParseResult {
  fields: Partial<IncomeFormState>;
  understood: { label: string; amount: number }[];
}

const UNIT_MULTIPLIERS: Record<string, number> = {
  lakh: 100_000,
  lakhs: 100_000,
  lac: 100_000,
  lacs: 100_000,
  l: 100_000,
  crore: 10_000_000,
  crores: 10_000_000,
  cr: 10_000_000,
  k: 1_000,
  thousand: 1_000,
};

// Matches an optional ₹/Rs prefix, a number (with optional commas/decimal),
// and an optional unit word (lakh, crore, k, etc).
const AMOUNT_RE =
  /(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(lakhs?|lacs?|crores?|cr|k|thousand|l)?\b/i;

function parseAmountToken(numStr: string, unit?: string): number {
  const clean = numStr.replace(/,/g, "");
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  if (unit) {
    const mult = UNIT_MULTIPLIERS[unit.toLowerCase()];
    if (mult) return Math.round(num * mult);
  }
  return Math.round(num);
}

const CATEGORY_PATTERNS: { key: keyof IncomeFormState; label: string; re: RegExp }[] = [
  { key: "homeLoanInterest", label: "home loan interest", re: /home\s*loan|housing\s*loan/i },
  { key: "hraExemption", label: "HRA exemption", re: /\bhra\b|house\s*rent/i },
  { key: "employerNps", label: "employer NPS", re: /\bnps\b|80\s*ccd/i },
  { key: "deduction80D", label: "80D health insurance", re: /80\s*d\b|health\s*insurance|mediclaim/i },
  {
    key: "deduction80C",
    label: "80C investments",
    re: /80\s*c\b|ppf|elss|epf|provident\s*fund|life\s*insurance/i,
  },
  { key: "grossIncome", label: "gross income", re: /salary|income|earn|ctc|gross/i },
];

/**
 * Splits a free-text message into segments and, for each segment containing
 * a recognizable amount, assigns it to a tax category based on nearby
 * keywords. If a segment has an amount but no keyword, and gross income
 * hasn't been set yet, it's assumed to be gross income (the most common
 * first thing people mention).
 */
export function parseChatMessage(
  text: string,
  current: IncomeFormState
): ParseResult {
  const segments = text
    .split(/,|;|\n|\band\b/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const fields: Partial<IncomeFormState> = {};
  const understood: { label: string; amount: number }[] = [];
  let grossAlreadyAssignedThisMessage = false;

  for (const seg of segments) {
    const amountMatch = seg.match(AMOUNT_RE);
    if (!amountMatch) continue;
    const amount = parseAmountToken(amountMatch[1], amountMatch[2]);
    if (!amount) continue;

    let matched = CATEGORY_PATTERNS.find(({ re }) => re.test(seg));

    if (
      !matched &&
      current.grossIncome === 0 &&
      !grossAlreadyAssignedThisMessage
    ) {
      matched = CATEGORY_PATTERNS.find((p) => p.key === "grossIncome");
    }

    if (matched) {
      fields[matched.key] = amount;
      understood.push({ label: matched.label, amount });
      if (matched.key === "grossIncome") grossAlreadyAssignedThisMessage = true;
    }
  }

  return { fields, understood };
}

export function buildClerkReply(
  result: ParseResult,
  fieldsAfter: IncomeFormState
): string {
  if (result.understood.length === 0) {
    return "I didn't catch a figure there. Try mentioning an amount with a unit, like \u201c18 lakh salary\u201d or \u201c1.5 lakh in 80C\u201d.";
  }

  const parts = result.understood.map(
    (u) => `${u.label} ₹${u.amount.toLocaleString("en-IN")}`
  );
  let reply = `Noted \u2014 ${parts.join(", ")}.`;

  if (fieldsAfter.grossIncome === 0) {
    reply += " I still need your gross annual income to estimate anything.";
  }

  return reply;
}
