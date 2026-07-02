"use client";

import { TaxBreakdown, formatINR } from "@/lib/taxCalc";

function LineItem({
  label,
  value,
  subtract,
  strong,
}: {
  label: string;
  value: number;
  subtract?: boolean;
  strong?: boolean;
}) {
  if (value === 0 && !strong) return null;
  return (
    <div className="flex items-baseline justify-between py-1">
      <span
        className={`text-sm ${
          strong ? "text-paper font-semibold" : "text-paper/70"
        }`}
      >
        {label}
      </span>
      <span
        className={`font-mono tabular text-sm ${
          strong ? "text-paper font-semibold text-base" : "text-paper/85"
        }`}
      >
        {subtract && value > 0 ? "− " : ""}
        {formatINR(value)}
      </span>
    </div>
  );
}

function RegimeColumn({
  title,
  breakdown,
  isBetter,
}: {
  title: string;
  breakdown: TaxBreakdown;
  isBetter: boolean;
}) {
  return (
    <div
      className={`flex-1 rounded-sm p-4 border ${
        isBetter
          ? "border-brass bg-white/[0.04]"
          : "border-paper/15 bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="font-serif text-paper text-sm font-semibold">
          {title}
        </p>
        {isBetter && (
          <span className="text-[10px] uppercase tracking-wider font-mono text-brass bg-brass/10 border border-brass/40 rounded-sm px-1.5 py-0.5">
            Lower tax
          </span>
        )}
      </div>
      <div className="border-t border-paper/15 pt-1">
        <LineItem label="Standard deduction" value={breakdown.standardDeduction} subtract />
        <LineItem label="Other deductions" value={breakdown.otherDeductions} subtract />
        <LineItem label="Taxable income" value={breakdown.taxableIncome} />
        <LineItem label="Tax on slabs" value={breakdown.slabTax} />
        <LineItem label="Rebate (87A)" value={breakdown.rebate} subtract />
        <LineItem label="Marginal relief" value={breakdown.marginalRelief} subtract />
        <LineItem label="Surcharge" value={breakdown.surcharge} />
        <LineItem label="Health & education cess" value={breakdown.cess} />
        <div className="border-t border-paper/20 mt-2 pt-2">
          <LineItem label="Total tax payable" value={breakdown.totalTax} strong />
        </div>
      </div>
    </div>
  );
}

export function ResultPanel({
  newRegime,
  oldRegime,
}: {
  newRegime: TaxBreakdown;
  oldRegime: TaxBreakdown;
}) {
  const hasIncome = newRegime.grossIncome > 0;
  const newWins = newRegime.totalTax <= oldRegime.totalTax;
  const savings = Math.abs(newRegime.totalTax - oldRegime.totalTax);
  const winnerLabel = newWins ? "New regime" : "Old regime";
  const winnerTax = newWins ? newRegime.totalTax : oldRegime.totalTax;

  return (
    <div className="bg-ink rounded-sm shadow-lg shadow-black/30 relative overflow-hidden">
      <div className="px-6 pt-5 pb-2">
        <p className="text-[11px] uppercase tracking-[0.14em] text-brass font-mono">
          Ledger receipt
        </p>
        <h2 className="font-serif text-xl font-semibold text-paper mt-0.5">
          Regime comparison
        </h2>
      </div>

      {hasIncome ? (
        <>
          <div className="px-6 flex gap-3 mt-2">
            <RegimeColumn title="New regime" breakdown={newRegime} isBetter={newWins} />
            <RegimeColumn title="Old regime" breakdown={oldRegime} isBetter={!newWins} />
          </div>

          <div className="px-6 mt-5 mb-6 flex items-center justify-center">
            <div
              key={`${winnerLabel}-${winnerTax}`}
              className="stamp-animate flex flex-col items-center justify-center w-40 h-40 rounded-full border-[3px] border-stamp text-stamp text-center"
              style={{ transform: "rotate(-6deg)" }}
            >
              <span className="font-mono text-[10px] uppercase tracking-widest">
                Recommended
              </span>
              <span className="font-serif font-bold text-sm mt-1 leading-tight px-2">
                {winnerLabel}
              </span>
              <span className="font-mono text-[11px] mt-1">
                {winnerTax === 0 ? "NIL TAX" : formatINR(winnerTax)}
              </span>
              {savings > 0 && (
                <span className="font-mono text-[9px] mt-0.5 text-stamp/80">
                  saves {formatINR(savings)}
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="px-6 py-14 text-center">
          <p className="text-paper/50 font-mono text-sm">
            Enter your gross annual income to see the ledger fill in.
          </p>
        </div>
      )}

      <div className="px-6 pb-5">
        <p className="text-[11px] text-paper/40 font-mono leading-relaxed">
          Estimate only, FY 2025-26 (AY 2026-27) rules. Not a substitute for
          the official computation — verify and file at{" "}
          <span className="text-paper/60">incometax.gov.in</span>.
        </p>
      </div>
    </div>
  );
}
