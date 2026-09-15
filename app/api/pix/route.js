import { createPixPayment } from "@/lib/mercadopago";
import { getClientIp, tooManyResponse, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(request) {
  const limited = rateLimit(getClientIp(request), { limit: 5, windowMs: 60_000 });
  if (!limited.allowed) {
    return tooManyResponse(limited.retryAfter);
  }

  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "E-mail inválido." }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)/.test(origin);
    const notificationUrl = isLocal ? null : `${origin}/api/pix/webhook`;

    const payment = await createPixPayment({
      email,
      description: "FinanceFlow - Acesso Vitalício",
      amount: 27,
      externalReference: `financeflow-${Date.now()}`,
      notificationUrl,
    });

    return Response.json(payment);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}