"use client";

import { IncomeFormState } from "@/lib/taxFields";
import { formatINR } from "@/lib/taxCalc";

const LABELS: { key: keyof IncomeFormState; label: string }[] = [
  { key: "grossIncome", label: "Gross income" },
  { key: "employerNps", label: "Employer NPS" },
  { key: "deduction80C", label: "80C" },
  { key: "deduction80D", label: "80D" },
  { key: "hraExemption", label: "HRA exemption" },
  { key: "homeLoanInterest", label: "Home loan interest" },
];

export function FieldsSummary({
  fields,
  onFieldsChange,
}: {
  fields: IncomeFormState;
  onFieldsChange: (next: IncomeFormState) => void;
}) {
  return (
    <div className="bg-paper-light rounded-sm shadow-lg shadow-black/20 px-6 py-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-brass-dark font-mono mb-2">
        As understood — click a figure to correct it
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
        {LABELS.map(({ key, label }) => (
          <label key={key} className="block">
            <span className="text-[11px] text-text-muted block mb-0.5">{label}</span>
            <span className="flex items-center gap-1">
              <span className="text-text-muted font-mono text-xs">₹</span>
              <input
                type="number"
                min={0}
                value={fields[key] === 0 ? "" : fields[key]}
                placeholder="0"
                onChange={(e) =>
                  onFieldsChange({ ...fields, [key]: Number(e.target.value) || 0 })
                }
                className="w-full bg-transparent font-mono text-sm tabular text-text placeholder:text-text-muted/40 outline-none border-b border-paper-line focus:border-brass transition-colors"
              />
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
