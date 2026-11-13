import { site } from "@/lib/site";

/**
 * A thin pass-through to lobbyd's public "try to charge twice" endpoint, so
 * the browser needs no cross-origin access. It forwards only a well-formed
 * key and nothing else, so it cannot be used to reach anything other than
 * that one endpoint.
 */
export const maxDuration = 60;

const KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const api = () => (process.env.LOBBYD_API_URL ?? site.lobbydApi).replace(/\/$/, "");

const unavailable = () => Response.json({ error: "unavailable" }, { status: 503 });

/** `?wake=1`: is the demo server up? `?key=…`: the server's own tally for a key. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  try {
    if (params.has("wake")) {
      const res = await fetch(`${api()}/healthz`, { cache: "no-store", signal: AbortSignal.timeout(55_000) });
      return Response.json({ awake: res.ok });
    }
    const key = params.get("key") ?? "";
    if (!KEY.test(key)) return Response.json({ error: "bad key" }, { status: 400 });
    const res = await fetch(`${api()}/try/charges/${key}`, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return unavailable();
    const tally = (await res.json()) as { requests_received: number; charges_made: number };
    return Response.json({ received: tally.requests_received, charges: tally.charges_made });
  } catch {
    return params.has("wake") ? Response.json({ awake: false }) : unavailable();
  }
}

/** One click: the same request, with the same key, every time. */
export async function POST(request: Request) {
  const { key } = (await request.json().catch(() => ({}))) as { key?: string };
  if (!key || !KEY.test(key)) return Response.json({ error: "bad key" }, { status: 400 });
  try {
    const res = await fetch(`${api()}/try/charges`, {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": key },
      body: JSON.stringify({ item: "ticket" }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    if (res.status === 429) return Response.json({ outcome: "limited" });
    if (!res.ok) return unavailable();
    const body = (await res.json()) as { charge_id: string };
    return Response.json({
      outcome: res.headers.get("idempotent-replay") === "true" ? "replayed" : "charged",
      chargeId: body.charge_id,
    });
  } catch {
    return unavailable();
  }
}
