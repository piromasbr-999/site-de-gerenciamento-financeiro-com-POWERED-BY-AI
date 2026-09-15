"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Mail, Send, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.push("/dashboard");
  };

  const handleSendLink = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Digite seu e-mail para receber o link mágico.");
      return;
    }
    setError("");
    setSendingLink(true);

    const { error: linkError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      emailRedirectTo: `${window.location.origin}/dashboard`,
    });

    setSendingLink(false);

    if (linkError) {
      setError(linkError.message);
      return;
    }

    setLinkSent(true);
  };

  const handleResetPassword = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Digite seu e-mail para redefinir a senha.");
      setResetSent(false);
      return;
    }
    setError("");
    setLinkSent(false);
    setSendingLink(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/reset-password` }
    );

    setSendingLink(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setResetSent(true);
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
          className="rounded-[28px] bg-gradient-to-br from-emerald-400/50 to-cyan-400/40 p-[1.5px] shadow-2xl shadow-purple-950/40"
        >
          <div className="rounded-[27px] bg-[#0c1222]/95 p-8 backdrop-blur-xl">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/30">
              <ShieldCheck size={24} />
            </span>
            <h1 className="mt-5 text-center text-2xl font-black tracking-tight text-white">
              Entrar no painel
            </h1>
            <p className="mt-1.5 text-center text-sm text-slate-400">
              Use o e-mail e a senha que você criou no onboarding.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div className="relative">
                <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com.br"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-11 pr-4 text-white placeholder-slate-600 outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/15"
                />
              </div>
              <div className="relative">
                <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-11 pr-4 text-white placeholder-slate-600 outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/15"
                />
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={sendingLink}
                  className="text-xs font-semibold text-cyan-300/80 transition hover:text-cyan-200 hover:underline disabled:opacity-60"
                >
                  Esqueci minha senha
                </button>
              </div>

              {error && (
                <p className="text-sm font-medium text-rose-400">{error}</p>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 py-4 text-base font-bold text-slate-950 shadow-lg shadow-emerald-500/30 disabled:opacity-60"
              >
                {loading ? "Entrando..." : "Entrar"}
              </motion.button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs font-medium text-slate-500">ou</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            {resetSent ? (
              <div className="rounded-2xl border border-cyan-400/25 bg-cyan-400/[0.06] p-4 text-center">
                <p className="text-sm font-semibold text-cyan-300">E-mail enviado!</p>
                <p className="mt-1 text-xs leading-relaxed text-cyan-200/80">
                  Se este e-mail estiver cadastrado, você receberá um link para criar uma nova
                  senha. Confira também a caixa de spam.
                </p>
              </div>
            ) : linkSent ? (
              <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4 text-center">
                <p className="text-sm font-semibold text-emerald-300">Link mágico enviado!</p>
                <p className="mt-1 text-xs leading-relaxed text-emerald-200/80">
                  Verifique a caixa de entrada de <span className="font-semibold">{email}</span> e
                  clique no link para entrar automaticamente.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSendLink}
                disabled={sendingLink}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-60"
              >
                <Send size={16} />
                {sendingLink ? "Enviando..." : "Entrar com link mágico por e-mail"}
              </button>
            )}

            <p className="mt-5 text-center text-xs text-slate-600">
              Ainda não pagou?{" "}
              <a href="/#checkout" className="font-semibold text-emerald-300 hover:underline">
                Libere o acesso por R$ 27,00
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}