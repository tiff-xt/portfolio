/** Tiny cross-island bus: any component can hand the assistant a question. */
const EVENT = "assistant:ask";

export function askAssistant(question: string) {
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: question }));
  document
    .getElementById("ask")
    ?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

export function onAsk(cb: (q: string) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<string>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
