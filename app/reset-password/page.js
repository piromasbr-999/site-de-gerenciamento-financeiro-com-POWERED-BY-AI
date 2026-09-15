"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Check, KeyRound, Loader2, Lock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setHasSession(Boolean(data.session?.user));
        setChecking(false);
      }
    });

    const { data: authSubscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        if (active) {
          setHasSession(true);
          setChecking(false);
        }
      }
    });

    return () => {
      active = false;
      authSubscription?.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }
    setError("");
    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b16] px-6">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <a
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition hover:text-slate-200"
        >
          <ArrowLeft size={15} />
          Voltar para o site
        </a>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[28px] bg-gradient-to-br from-indigo-400/50 to-cyan-400/40 p-[1.5px] shadow-2xl shadow-purple-950/40"
        >
          <div className="rounded-[27px] bg-[#0c1222]/95 p-8 backdrop-blur-xl">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-400 to-cyan-500 text-slate-950 shadow-lg shadow-indigo-500/30">
              <KeyRound size={24} />
            </span>
            <h1 className="mt-5 text-center text-2xl font-black tracking-tight text-white">
              {done ? "Senha atualizada!" : "Criar nova senha"}
            </h1>
            <p className="mt-1.5 text-center text-sm text-slate-400">
              {done
                ? "Você será redirecionado para entrar no painel."
                : "Escolha uma senha nova para a sua conta."}
            </p>

            {!checking && !hasSession && !done && (
              <div className="mt-7 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5 text-center">
                <p className="text-sm font-semibold text-rose-300">Link inválido ou expirado</p>
                <p className="mt-1 text-xs text-rose-200/80">
                  Solicite novamente na tela de login clicando em "Esqueci minha senha".
                </p>
                <a
                  href="/login"
                  className="mt-4 inline-block rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  Ir para o login
                </a>
              </div>
            )}

            {hasSession && !done && (
              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <div className="relative">
                  <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nova senha (mín. 6 caracteres)"
                    disabled={loading}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-11 pr-4 text-white placeholder-slate-600 outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/15 disabled:opacity-60"
                  />
                </div>
                <div className="relative">
                  <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirme a nova senha"
                    disabled={loading}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-11 pr-4 text-white placeholder-slate-600 outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/15 disabled:opacity-60"
                  />
                </div>

                {error && <p className="text-sm font-medium text-rose-400">{error}</p>}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 py-4 text-base font-bold text-slate-950 shadow-lg shadow-emerald-500/30 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      Salvando...
                    </span>
                  ) : (
                    "Salvar nova senha"
                  )}
                </motion.button>
              </form>
            )}

            {done && (
              <div className="mt-7 flex items-center justify-center gap-2.5 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3.5 text-sm font-semibold text-emerald-300">
                <Check size={17} strokeWidth={3} />
                Senha salva, redirecionando...
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}