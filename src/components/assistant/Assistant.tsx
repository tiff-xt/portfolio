"use client";
import { useEffect, useRef, useState } from "react";
import { useChat, type Turn } from "./useChat";
import { onAsk } from "./bus";
import { Rich } from "./rich";
import { SectionHeading } from "../sections/SectionHeading";

const SUGGESTIONS = [
  "How do you make large visualizations fast?",
  "How do you design AI features people can trust?",
  "What's your take on design systems?",
  "How do you debug shared real-time state?",
];

export function Assistant() {
  const { turns, busy, send, stop, reset } = useChat();
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const last = turns.at(-1);

  // Questions handed over from elsewhere on the page.
  useEffect(
    () =>
      onAsk((q) => {
        setTimeout(() => send(q), 450);
      }),
    [send],
  );

  // Keep the newest tokens in view, unless the reader scrolled up.
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [turns]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!draft.trim()) return;
    send(draft);
    setDraft("");
  };

  return (
    <section id="ask" className="px-5 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto max-w-6xl">
        <SectionHeading index="04" kicker="Ask" title="Ask me anything technical." />

        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          {/* Conversation */}
          <div className="flex min-h-[32rem] flex-col overflow-hidden rounded-3xl border border-line bg-surface">
            <div
              ref={logRef}
              role="log"
              aria-live="polite"
              aria-busy={busy}
              aria-label="Conversation"
              className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-8"
              style={{ maxHeight: "36rem" }}
            >
              {turns.length === 0 ? (
                <div className="flex h-full flex-col justify-between gap-10">
                  <p className="max-w-lg text-lg leading-relaxed text-muted">
                    This assistant answers from my own notes about how I work and what I know. It cites what it used,
                    and you can see exactly how each answer was produced.
                  </p>
                  <div>
                    <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted">Try</p>
                    <ul className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((s) => (
                        <li key={s}>
                          <button
                            type="button"
                            onClick={() => send(s)}
                            className="rounded-full border border-line bg-bg px-4 py-2 text-left text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong active:translate-y-0"
                          >
                            {s}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                turns.map((t) => <Message key={t.id} turn={t} />)
              )}
            </div>

            <form onSubmit={submit} className="border-t border-line p-3 sm:p-4">
              <div className="flex items-end gap-2 rounded-2xl border border-line bg-bg p-2 transition-colors focus-within:border-line-strong">
                <label htmlFor="ask-input" className="sr-only">
                  Your question
                </label>
                <textarea
                  id="ask-input"
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      submit();
                    }
                  }}
                  rows={1}
                  maxLength={2000}
                  placeholder="Ask about frontend, data viz, AI, testing…"
                  className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 outline-none [field-sizing:content] placeholder:text-muted focus-visible:outline-none"
                />
                {busy ? (
                  <button
                    type="button"
                    onClick={stop}
                    className="grid size-10 place-items-center rounded-xl bg-surface-2 transition-colors hover:bg-line"
                    aria-label="Stop generating"
                  >
                    <span className="size-3 rounded-[3px] bg-fg" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="grid size-10 place-items-center rounded-xl bg-accent text-accent-fg transition-all duration-200 enabled:hover:scale-105 enabled:active:scale-95 disabled:opacity-30"
                    aria-label="Send"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      aria-hidden
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between px-2 font-mono text-[11px] text-muted">
                <span>Enter to send · Shift+Enter for a new line</span>
                {turns.length > 0 && (
                  <button type="button" onClick={reset} className="hover:text-fg">
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Pipeline inspector */}
          <Pipeline turn={last?.role === "assistant" ? last : undefined} />
        </div>
      </div>
    </section>
  );
}

function Message({ turn }: { turn: Turn }) {
  if (turn.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-fg px-4 py-2.5 text-bg">{turn.content}</p>
      </div>
    );
  }
  const streaming = turn.status === "streaming";
  return (
    <div className="max-w-[92%] motion-safe:animate-[chip-in_500ms_var(--ease-out)_both]">
      {turn.notice && <p className="mb-2 font-mono text-xs text-accent">{turn.notice}</p>}
      <div className={`leading-relaxed ${turn.status === "error" ? "text-accent" : ""}`}>
        {turn.content ? (
          <div className={streaming ? "caret" : ""}>
            <Rich text={turn.content} />
          </div>
        ) : (
          <Thinking />
        )}
      </div>
      {turn.status === "stopped" && <p className="mt-2 font-mono text-xs text-muted">Stopped.</p>}
      {!!turn.sources?.length && !streaming && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Sources used">
          {turn.sources.map((s) => (
            <li key={s.id} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-muted">
              {s.heading}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Thinking() {
  return (
    <span className="inline-flex gap-1 py-2" role="status" aria-label="Thinking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-muted motion-safe:animate-[pulse-dot_1.1s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 140}ms` }}
        />
      ))}
    </span>
  );
}

/** Shows what actually happened for the latest answer. */
function Pipeline({ turn }: { turn?: Turn }) {
  const policyBlocked = turn?.mode === "policy";
  const steps = [
    {
      label: "Policy check",
      detail: !turn
        ? "Deterministic topic rules run before anything else."
        : policyBlocked
          ? "Out of scope: answered by rule, no model call."
          : "Passed.",
      state: !turn ? "idle" : "done",
    },
    {
      label: "Retrieval",
      detail: !turn?.retrieval
        ? "Finds the relevant sections of my notes."
        : turn.retrieval === "none"
          ? "Skipped."
          : `${turn.retrieval === "vector" ? "pgvector similarity" : "BM25 keyword ranking"} · ${turn.sources?.length ?? 0} section${turn.sources?.length === 1 ? "" : "s"}`,
      state: !turn ? "idle" : turn.retrieval ? "done" : "active",
    },
    {
      label: "Generation",
      detail: !turn?.mode
        ? "Grounded answer, streamed token by token."
        : turn.mode === "ai"
          ? `${turn.model ?? "Model"} on Cloudflare Workers AI, constrained to the retrieved notes.`
          : turn.mode === "demo"
            ? "Extractive fallback: quotes my notes directly, no model."
            : "Not needed.",
      state: !turn ? "idle" : turn.status === "streaming" && turn.mode ? "active" : turn.mode ? "done" : "idle",
    },
  ] as const;

  return (
    <aside aria-label="How this answer was produced" className="rounded-3xl border border-line p-6">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">How it works</p>
      <ol className="relative mt-6 space-y-6">
        <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-px bg-line" />
        {steps.map((s) => (
          <li key={s.label} className="relative pl-7">
            <span
              aria-hidden
              className={`absolute left-0 top-1.5 size-[11px] rounded-full border-2 transition-all duration-500 ${
                s.state === "done"
                  ? "border-accent-2 bg-accent-2"
                  : s.state === "active"
                    ? "border-accent bg-bg motion-safe:animate-[pulse-dot_1.1s_ease-in-out_infinite]"
                    : "border-line-strong bg-bg"
              }`}
            />
            <p className="font-medium">{s.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{s.detail}</p>
          </li>
        ))}
      </ol>
      {turn?.ms != null && (
        <p className="mt-6 border-t border-line pt-4 font-mono text-[11px] tabular-nums text-muted">
          {(turn.ms / 1000).toFixed(2)}s end to end
        </p>
      )}
      <p className="mt-6 text-xs leading-relaxed text-muted">
        Question text is never stored. Only anonymous counts (which sections were used, latency) are recorded.
      </p>
    </aside>
  );
}
