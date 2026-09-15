import { createHmac, timingSafeEqual } from "node:crypto";

import { approveIfApproved } from "@/lib/mercadopago";

export const runtime = "nodejs";

function parseSignature(raw) {
  let ts = "";
  let v1 = "";
  for (const part of String(raw).split(",")) {
    const trimmed = part.trim();
    if (trimmed.startsWith("ts=")) ts = trimmed.slice(3);
    if (trimmed.startsWith("v1=")) v1 = trimmed.slice(3);
  }
  return { ts, v1 };
}

function verifySignature(paymentId, ts, v1) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret || !paymentId || !ts || !v1) {
    return false;
  }

  const timestamp = Number(ts);
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() - timestamp * 1000) > 60_000) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${paymentId}.${ts}`)
    .digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(v1, "hex");

  try {
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request) {
  const raw = await request.text().catch(() => "");
  let body = {};
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    body = {};
  }

  const { searchParams } = new URL(request.url);
  const paymentId = body?.data?.id ?? searchParams.get("data_id") ?? searchParams.get("id");

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  let valid = true;

  if (secret) {
    const { ts, v1 } = parseSignature(request.headers.get("x-signature") ?? "");
    valid = verifySignature(paymentId, ts, v1);
  }

  if (valid && paymentId) {
    approveIfApproved(paymentId).catch(() => {});
  }

  return Response.json({ received: true });
}