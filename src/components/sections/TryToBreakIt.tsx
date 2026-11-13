"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type Outcome = "pending" | "charged" | "replayed" | "limited" | "failed";
type Server = "asleep" | "waking" | "awake" | "down";
type Tally = { received: number; charges: number };

/** A key's allowance on the server is 80 requests; stop a little short of it. */
const MAX_CLICKS = 60;
const BURST = 20;

const DOT: Record<Outcome, string> = {
  pending: "border border-line-strong animate-pulse",
  charged: "bg-accent",
  replayed: "bg-accent-2/70",
  limited: "bg-line-strong",
  failed: "bg-line-strong",
};

/**
 * One ticket, one button, and an invitation to press it as fast as you can.
 * Every press sends the same request with the same idempotency key to the
 * live lobbyd API. The numbers underneath are the server's own count.
 */
export function TryToBreakIt() {
  const [server, setServer] = useState<Server>("asleep");
  const [key, setKey] = useState("");
  const [sent, setSent] = useState<Outcome[]>([]);
  const [tally, setTally] = useState<Tally | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const inFlight = useRef(0);

  // The demo API sleeps on its free tier. Wake it as the panel comes near.
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    let cancelled = false;
    const wake = async () => {
      setServer("waking");
      for (let attempt = 0; attempt < 4 && !cancelled; attempt++) {
        const res = await fetch("/api/try?wake=1").catch(() => null);
        const body = res?.ok ? ((await res.json()) as { awake: boolean }) : null;
        if (cancelled) return;
        if (body?.awake) return setServer("awake");
      }
      if (!cancelled) setServer("down");
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setKey(crypto.randomUUID());
        void wake();
      },
      { rootMargin: "800px" },
    );
    io.observe(node);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, []);

  const count = useCallback(async (forKey: string) => {
    const res = await fetch(`/api/try?key=${forKey}`).catch(() => null);
    if (res?.ok) setTally((await res.json()) as Tally);
  }, []);

  const press = useCallback(
    (times: number) => {
      if (!key || server !== "awake") return;
      const room = Math.min(times, MAX_CLICKS - sent.length);
      if (room <= 0) return;
      const first = sent.length;
      setSent((all) => [...all, ...Array<Outcome>(room).fill("pending")]);
      for (let n = 0; n < room; n++) {
        inFlight.current++;
        fetch("/api/try", { method: "POST", body: JSON.stringify({ key }) })
          .then(async (res) => (res.ok ? ((await res.json()) as { outcome: Outcome }).outcome : "failed"))
          .catch((): Outcome => "failed")
          .then((outcome) => {
            setSent((all) => all.map((was, i) => (i === first + n ? outcome : was)));
            // Ask the server for its count once the burst has settled.
            if (--inFlight.current === 0) void count(key);
          });
      }
    },
    [count, key, sent.length, server],
  );

  const reset = () => {
    setKey(crypto.randomUUID());
    setSent([]);
    setTally(null);
  };

  const ready = server === "awake";
  const full = sent.length >= MAX_CLICKS;
  const settled = sent.length > 0 && sent.every((outcome) => outcome !== "pending");

  return (
    <div ref={root} className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center lg:gap-12">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            <span className="text-accent">Try it</span> / live against the lobbyd API
          </p>
          <h3 className="mt-3 font-display text-3xl leading-tight tracking-tight sm:text-4xl">
            Try to charge yourself twice.
          </h3>
          <p className="mt-3 max-w-md leading-relaxed text-muted">
            This buys one $25 ticket. Press it as fast as you can, or fire twenty at once. Every press sends the same
            request with the same idempotency key, so the first does the work and the rest get its answer back.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => press(1)}
              disabled={!ready || full}
              className="inline-flex h-12 items-center rounded-full bg-fg px-6 text-sm font-medium text-bg transition-transform duration-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Buy ticket · $25
            </button>
            <button
              type="button"
              onClick={() => press(BURST)}
              disabled={!ready || full}
              className="inline-flex h-12 items-center rounded-full border border-line-strong px-5 text-sm font-medium transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send {BURST} at once
            </button>
            {sent.length > 0 && (
              <button
                type="button"
                onClick={reset}
                className="text-sm text-muted underline decoration-line-strong underline-offset-4 hover:text-fg"
              >
                New ticket
              </button>
            )}
          </div>
          <p className="mt-4 flex items-center gap-2 font-mono text-[11px] text-muted" role="status">
            <span
              className={`size-1.5 rounded-full ${
                ready ? "bg-accent-2" : server === "down" ? "bg-line-strong" : "animate-pulse bg-accent"
              }`}
            />
            {ready
              ? "Demo server awake. No real money."
              : server === "down"
                ? "The demo server is not answering right now."
                : "Waking the demo server. Its free tier sleeps, so this can take a minute."}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-bg/60 p-5 sm:p-6">
          <dl className="grid grid-cols-3 gap-4">
            <Stat label="You sent" value={sent.length} />
            <Stat label="Server received" value={tally?.received} />
            <Stat label="Charges made" value={tally?.charges} strong />
          </dl>
          <div className="mt-5 flex min-h-[4.5rem] flex-wrap content-start gap-1.5" aria-hidden>
            {sent.map((outcome, i) => (
              <span key={i} className={`size-3.5 rounded-[3px] ${DOT[outcome]}`} />
            ))}
            {sent.length === 0 && (
              <span className="font-mono text-[11px] text-muted">Each press appears here as a square.</span>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-muted">
            <Legend className="bg-accent" text="did the work" />
            <Legend className="bg-accent-2/70" text="got the first answer back" />
          </div>
          <p className="mt-4 min-h-[3rem] border-t border-line pt-4 text-sm leading-relaxed" aria-live="polite">
            {settled && tally ? (
              tally.charges === 1 ? (
                <>
                  The server received <b>{tally.received}</b> {tally.received === 1 ? "request" : "requests"} and made{" "}
                  <b>1 charge</b>.{" "}
                  <span className="text-muted">
                    {tally.received === 1 ? "Now press it again." : "That count comes from its database, not this page."}
                  </span>
                </>
              ) : (
                <>
                  The server reports {tally.charges} charges for {tally.received} requests.
                </>
              )
            ) : settled ? (
              <span className="text-muted">Could not reach the server for its count.</span>
            ) : (
              <span className="text-muted">
                {full ? "That is this ticket's limit. Start a new one." : "The server's own count shows up here."}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, strong }: { label: string; value: number | undefined; strong?: boolean }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className={`mt-1 font-display text-4xl tabular-nums sm:text-5xl ${strong ? "text-accent" : ""}`}>
        {value ?? "–"}
      </dd>
    </div>
  );
}

function Legend({ className, text }: { className: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-2.5 rounded-[2px] ${className}`} />
      {text}
    </span>
  );
}
