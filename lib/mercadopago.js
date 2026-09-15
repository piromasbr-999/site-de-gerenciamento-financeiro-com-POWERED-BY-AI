import { randomUUID } from "node:crypto";

import { ensureAuthUser } from "@/lib/supabase-auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const MP_API = "https://api.mercadopago.com";

const EXPECTED_AMOUNT = 27;

function accessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "MERCADOPAGO_ACCESS_TOKEN não configurado. Adicione seu token no arquivo .env.local."
    );
  }
  return token;
}

export async function createPixPayment({
  email,
  description,
  amount,
  externalReference,
  notificationUrl,
  idempotencyKey = randomUUID(),
}) {
  const body = {
    transaction_amount: amount,
    description,
    payment_method_id: "pix",
    payer: {
      email,
    },
    external_reference: externalReference,
  };

  if (notificationUrl) {
    body.notification_url = notificationUrl;
  }

  const res = await fetch(`${MP_API}/v1/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const detail = Array.isArray(data.cause)
      ? data.cause.map((c) => c.description).join(" ")
      : data.message;
    throw new Error(detail || "Erro ao criar o pagamento Pix.");
  }

  const transaction = data.point_of_interaction?.transaction_data ?? {};
  const rawBase64 = transaction.qr_code_base64;
  const qrBase64 =
    rawBase64 && !rawBase64.startsWith("data:")
      ? `data:image/png;base64,${rawBase64}`
      : rawBase64;

  return {
    id: data.id,
    status: data.status,
    qrCode: transaction.qr_code,
    qrBase64,
    ticketUrl: transaction.ticket_url,
  };
}

export async function getPixPayment(id) {
  const res = await fetch(`${MP_API}/v1/payments/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken()}`,
    },
  });

  if (!res.ok) {
    throw new Error("Pagamento não encontrado.");
  }

  return res.json();
}

export async function approveIfApproved(id) {
  const payment = await getPixPayment(id);

  if (payment.status === "approved") {
    const amount = Number(payment.transaction_amount);
    if (!Number.isFinite(amount) || Math.abs(amount - EXPECTED_AMOUNT) > 0.01) {
      return "pending";
    }
    const email = payment.payer?.email;
    if (email) {
      const { user } = await ensureAuthUser(email);
      const { error: profileError } = await getSupabaseAdmin()
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email ?? email,
            has_access: true,
          },
          { onConflict: "id" }
        );
      if (!profileError) {
        await getSupabaseAdmin()
          .from("profiles")
          .update({ has_access: true })
          .eq("id", user.id);
      }
    }
  }

  return payment.status;
}