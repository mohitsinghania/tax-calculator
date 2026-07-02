# ITR Ledger — Income Tax Estimator (India, FY 2025-26)

A chat-style income tax estimator. You describe your income and deductions
in plain language; a rule-based parser (regex, not an LLM) extracts
figures; a deterministic calculator compares the old vs new regime live.

**Fully free to run and host.** Everything happens in the browser — no
API key, no server calls, no per-message cost. No data ever leaves the
device.

## Why not a real LLM?

An earlier version of this called the Anthropic API for extraction. That
works better with oddly-phrased sentences, but it costs money per request
and needs an API key + a paid Anthropic account. This version trades some
of that flexibility for being genuinely free forever — it recognizes
common patterns like:

- "18 lakh salary" / "I earn 12L" / "CTC is 15 lakhs"
- "50k employer NPS" / "1.5 lakh in 80C" / "80D 25000"
- "2 lakh home loan interest"

It expects roughly one figure per comma-separated phrase, with a keyword
nearby (salary, NPS, 80C, 80D, HRA, home loan). It won't parse free-flowing
paragraphs as gracefully as an LLM would — that's the trade-off. The
editable summary strip under the chat lets people fix any misreading.

If you want LLM-grade parsing again later and are fine with the ongoing
API cost, see the "Adding a real LLM back" note at the bottom.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — no `.env` file needed.

## Deploy for free (Vercel)

1. Push to GitHub.
2. vercel.com → Add New Project → pick the repo → Deploy. No environment
   variables needed.
3. Live in about a minute. Vercel's free tier is enough for this; there's
   nothing to pay for on either side.

## How it works

- `lib/parseChat.ts` — the rule-based extractor. Splits a message into
  comma-separated segments, matches amount patterns (numbers with lakh/
  crore/k units), and assigns each to a category based on nearby keywords.
- `components/ChatPanel.tsx` — the chat UI, calls the parser directly
  (no network request).
- `components/FieldsSummary.tsx` — compact, editable strip showing what
  was understood, for correcting misreads.
- `lib/taxCalc.ts` — deterministic tax math, unchanged.

## Updating tax rules for a new financial year

All slabs, rebate thresholds, deduction caps, and surcharge rates live in
`lib/taxCalc.ts`. After each Union Budget (usually late January/February,
effective the following April), search for the new figures and update the
constants at the top of that file.

## Adding a real LLM back later (optional, has a cost)

If parsing quality matters more than staying free, you can reintroduce a
server API route that calls an LLM with a forced tool call to extract the
same fields `parseChat.ts` produces now, and swap `ChatPanel`'s `send()`
to call that route instead of `parseChatMessage()`. That requires an API
key from your chosen provider and billing enabled on that account — budget
for it before switching, since usage is billed per request even at low
volume.

## What's covered / not covered

Covered: salary + other-source income, standard deduction, employer NPS
(80CCD(2)), 80C, 80D, HRA exemption (enter the exemption amount directly),
home loan interest, Section 87A rebate with marginal relief, simplified
surcharge, 4% cess.

Not covered: capital gains, business/professional income, foreign income,
senior-citizen slab variants, less common deductions (80G, 80E, etc).

This tool does not file returns — it only estimates. File the actual
return at the official portal, incometax.gov.in.
