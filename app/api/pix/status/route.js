import { approveIfApproved } from "@/lib/mercadopago";
import { getClientIp, tooManyResponse, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(request) {
  const limited = rateLimit(getClientIp(request), { limit: 30, windowMs: 60_000 });
  if (!limited.allowed) {
    return tooManyResponse(limited.retryAfter);
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("paymentId");

    if (!id) {
      return Response.json({ error: "paymentId é obrigatório." }, { status: 400 });
    }

    const status = await approveIfApproved(id);

    return Response.json({ status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}