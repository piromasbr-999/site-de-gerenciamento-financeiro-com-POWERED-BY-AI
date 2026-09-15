import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function findUserByEmail(email) {
  const normalized = String(email).trim().toLowerCase();

  const { data, error } = await getSupabaseAdmin().auth.admin.listUsers({
    perPage: 1000,
    filter: { email: normalized },
  });

  if (!error) {
    const found = data.users.find(
      (u) => u.email && u.email.toLowerCase() === normalized
    );
    if (found) {
      return found;
    }
  }

  let page = 1;
  const total = data?.total ?? 0;
  while (page * 1000 < Math.max(total, 1000)) {
    const { data: next, error: nextError } =
      await getSupabaseAdmin().auth.admin.listUsers({
        page,
        perPage: 1000,
      });
    if (nextError) {
      break;
    }
    const found = next.users.find(
      (u) => u.email && u.email.toLowerCase() === normalized
    );
    if (found) {
      return found;
    }
    page += 1;
  }

  return null;
}

export async function ensureAuthUser(email) {
  const existing = await findUserByEmail(email);
  if (existing) {
    return { user: existing, created: false };
  }

  const { data, error } = await getSupabaseAdmin().auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (error) {
    if (/already( |\'s|s) (been )?(reg|used)|already registered/i.test(error.message)) {
      const retry = await findUserByEmail(email);
      if (retry) {
        return { user: retry, created: false };
      }
    }
    throw new Error(error.message);
  }

  const user = data?.user ?? data;
  return { user, created: true };
}