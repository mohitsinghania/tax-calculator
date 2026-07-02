"use client";

import { useMemo, useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { FieldsSummary } from "@/components/FieldsSummary";
import { ResultPanel } from "@/components/ResultPanel";
import { IncomeFormState, emptyFields } from "@/lib/taxFields";
import { computeNewRegime, computeOldRegime } from "@/lib/taxCalc";

export default function Home() {
  const [fields, setFields] = useState<IncomeFormState>(emptyFields);

  const newRegime = useMemo(
    () => computeNewRegime(fields.grossIncome, fields.employerNps),
    [fields.grossIncome, fields.employerNps]
  );

  const oldRegime = useMemo(
    () =>
      computeOldRegime(fields.grossIncome, {
        deduction80C: fields.deduction80C,
        deduction80D: fields.deduction80D,
        hraExemption: fields.hraExemption,
        homeLoanInterest: fields.homeLoanInterest,
      }),
    [
      fields.grossIncome,
      fields.deduction80C,
      fields.deduction80D,
      fields.hraExemption,
      fields.homeLoanInterest,
    ]
  );

  return (
    <main className="min-h-screen bg-ink">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <header className="mb-8 sm:mb-10">
          <p className="text-[11px] uppercase tracking-[0.2em] text-brass font-mono">
            ITR Ledger
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-paper mt-1">
            Income tax estimator
          </h1>
          <p className="text-paper/60 text-sm mt-2 max-w-xl">
            Describe your income and deductions in plain language. The clerk
            listens and fills in the ledger — the tax math itself is always
            computed deterministically, never guessed by the AI.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_1fr] gap-5 sm:gap-6 items-start">
          <div className="space-y-5">
            <ChatPanel fields={fields} onFieldsChange={setFields} />
            <FieldsSummary fields={fields} onFieldsChange={setFields} />
          </div>
          <ResultPanel newRegime={newRegime} oldRegime={oldRegime} />
        </div>

        <footer className="mt-10 text-center">
          <p className="text-paper/35 text-xs font-mono">
            Not tax advice. For informational estimation only — file your
            return at the official Income Tax e-filing portal.
          </p>
        </footer>
      </div>
    </main>
  );
}
