const buckets = new Map();

export function getClientIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function rateLimit(identifier, { limit, windowMs }) {
  const now = Date.now();
  const entry = buckets.get(identifier) ?? { count: 0, resetAt: now + windowMs };

  if (entry.resetAt <= now) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count += 1;
  buckets.set(identifier, entry);

  if (buckets.size > 2000) {
    for (const [key, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(key);
    }
  }

  const allowed = entry.count <= limit;
  return {
    allowed,
    retryAfter: Math.max(0, Math.ceil((entry.resetAt - now) / 1000)),
  };
}

export function tooManyResponse(retryAfter) {
  return Response.json(
    { error: "Muitas requisições. Tente novamente em instantes." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}