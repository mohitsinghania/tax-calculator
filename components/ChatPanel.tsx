"use client";

import { useRef, useState, useEffect } from "react";
import { IncomeFormState } from "@/lib/taxFields";
import { parseChatMessage, buildClerkReply } from "@/lib/parseChat";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const GREETING =
  "Tell me about your income and deductions \u2014 for example: \u201c18 lakh salary, 50k employer NPS, 1.5 lakh in 80C\u201d. Mention one figure per phrase, separated by commas.";

export function ChatPanel({
  fields,
  onFieldsChange,
}: {
  fields: IncomeFormState;
  onFieldsChange: (next: IncomeFormState) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send() {
    const text = input.trim();
    if (!text) return;

    const result = parseChatMessage(text, fields);
    const nextFields = { ...fields, ...result.fields };
    const reply = buildClerkReply(result, nextFields);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: reply },
    ]);
    setInput("");
    onFieldsChange(nextFields);
  }

  return (
    <div className="bg-paper-light rounded-sm shadow-lg shadow-black/20 flex flex-col h-[560px]">
      <div className="px-6 pt-5 pb-3 border-b border-paper-line">
        <p className="text-[11px] uppercase tracking-[0.14em] text-brass-dark font-mono">
          Intake · FY 2025-26 · runs locally, no cost
        </p>
        <h2 className="font-serif text-xl font-semibold text-ink mt-0.5">
          Tell the clerk your situation
        </h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-sm px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-ink text-paper"
                  : "bg-paper border border-paper-line text-text"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-paper-line flex gap-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="e.g. 18 lakh salary, 2 lakh home loan interest"
          className="flex-1 resize-none bg-transparent border border-paper-line rounded-sm px-3 py-2 text-sm text-text outline-none focus:border-brass transition-colors"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="shrink-0 bg-ink text-paper text-sm font-medium px-4 rounded-sm disabled:opacity-40 hover:bg-ink-light transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
