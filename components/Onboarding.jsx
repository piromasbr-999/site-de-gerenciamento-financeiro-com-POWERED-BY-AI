"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  ChevronRight,
  DollarSign,
  Lock,
  LogIn,
  Mail,
  PiggyBank,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { formatBrlInput, brlToNumber } from "@/lib/format";

const EASE = [0.22, 1, 0.36, 1];

const GENDERS = ["Masculino", "Feminino", "Outro", "Preferir não dizer"];

const GOALS = [
  { label: "Economizar dinheiro", icon: PiggyBank },
  { label: "Sair das dívidas", icon: TrendingUp },
  { label: "Investir mais", icon: Wallet },
  { label: "Organizar gastos", icon: BadgeCheck },
];

function passwordStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { label: "Fraca", level: 1, bar: "bg-rose-500", text: "text-rose-400" };
  if (score <= 4) return { label: "Média", level: 2, bar: "bg-amber-400", text: "text-amber-300" };
  return { label: "Forte", level: 3, bar: "bg-emerald-400", text: "text-emerald-300" };
}

const stepVariant = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -28 },
};

export default function Onboarding({ defaultEmail = "", onComplete }) {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [formError, setFormError] = useState("");

  const [data, setData] = useState({
    email: defaultEmail,
    name: "",
    age: "",
    gender: "",
    income: "",
    goal: "",
  });
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const strength = passwordStrength(password);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (sessionData.session?.user) {
        setUser(sessionData.session.user);
        setStep(0);
      }
    });

    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setStep(0);
        }
      }
    );

    return () => authSubscription?.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setFormError("");
  }, [step, linkSent]);

  const set = (key) => (e) => {
    const value = key === "income" ? formatBrlInput(e.target.value) : e.target.value;
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSendLink = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setFormError("Digite o e-mail usado no pagamento.");
      return;
    }
    setFormError("");
    setSendingLink(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: data.email.trim().toLowerCase(),
      emailRedirectTo: `${window.location.origin}/dashboard`,
    });

    setSendingLink(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    setLinkSent(true);
  };

  const validateStep = () => {
    if (step === 0) {
      if (!data.name.trim()) {
        setFormError("Como você quer ser chamado?");
        return false;
      }
      const age = Number(data.age);
      if (!data.age || Number.isNaN(age) || age < 14 || age > 120) {
        setFormError("Informe sua idade.");
        return false;
      }
      if (!data.gender) {
        setFormError("Selecione seu gênero.");
        return false;
      }
    }
    if (step === 1) {
      const income = brlToNumber(data.income);
      if (income <= 0) {
        setFormError("Informe sua renda mensal.");
        return false;
      }
      if (!data.goal) {
        setFormError("Escolha seu principal objetivo.");
        return false;
      }
    }
    if (step === 2) {
      if (password.length < 8) {
        setFormError("A senha deve ter no mínimo 8 caracteres.");
        return false;
      }
      if (password !== confirm) {
        setFormError("As senhas não conferem.");
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (!user) {
      setFormError("Confirme seu e-mail pelo link mágico antes de continuar.");
      return;
    }

    setLoading(true);
    setFormError("");

    const { error: passwordError } = await supabase.auth.updateUser({
      password,
    });

    if (passwordError) {
      const alreadyHasPassword =
        passwordError.message &&
        passwordError.message.toLowerCase().includes("different from the old");

      if (!alreadyHasPassword) {
        setLoading(false);
        setFormError(passwordError.message);
        return;
      }
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email ?? data.email.trim().toLowerCase(),
          name: data.name.trim(),
          age: Number(data.age),
          gender: data.gender,
          monthly_income: brlToNumber(data.income),
          financial_goal: data.goal,
          onboarding_completed: true,
        },
        { onConflict: "id" }
      );

    setLoading(false);

    if (profileError) {
      setFormError(profileError.message);
      return;
    }

    onComplete();
  };

  const labels = ["Perfil", "Finanças", "Segurança"];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b16] px-6 py-14">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-10 -left-10 h-64 w-64 rounded-full bg-rose-500/10 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative z-10 w-full max-w-lg rounded-[28px] bg-gradient-to-br from-indigo-500/50 via-purple-500/30 to-emerald-400/40 p-[1.5px] shadow-2xl shadow-purple-950/40"
      >
        <div className="rounded-[27px] bg-[#0c1222]/95 p-7 backdrop-blur-xl sm:p-9">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/30">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-white">Configure sua conta</p>
              <p className="text-xs text-slate-400">É rápido — seu painel está te esperando.</p>
            </div>
          </div>

          {user && (
            <div className="mt-7 flex items-center gap-2">
              {labels.map((label, i) => (
                <div key={label} className="flex flex-1 items-center gap-2">
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-colors ${
                      i < step
                        ? "bg-emerald-400 text-slate-950"
                        : i === step
                          ? "bg-white/15 text-white"
                          : "bg-white/5 text-slate-500"
                    }`}
                  >
                    {i < step ? <Check size={12} strokeWidth={3} /> : i + 1}
                  </span>
                  <span
                    className={`hidden text-xs font-medium sm:block ${
                      i <= step ? "text-slate-200" : "text-slate-600"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 min-h-[320px]">
            {!user ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {linkSent ? (
                  <div className="text-center">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                      <Mail size={24} />
                    </span>
                    <h3 className="mt-5 text-lg font-bold text-white">Link mágico enviado!</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      Enviamos um link de confirmação para{" "}
                      <span className="font-semibold text-emerald-300">{data.email}</span>.
                      Clique nele e sua conta será verificada automaticamente. Esta janela
                      avança sozinha ao confirmar.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-2.5 text-sm font-medium text-emerald-300">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      </span>
                      Aguardando confirmação...
                    </div>
                    <button
                      onClick={() => {
                        setLinkSent(false);
                        setFormError("");
                      }}
                      className="mt-5 text-xs font-medium text-slate-500 underline-offset-4 transition hover:text-slate-300 hover:underline"
                    >
                      Trocar de e-mail
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="rounded-2xl border border-cyan-400/25 bg-cyan-400/[0.06] p-4">
                      <p className="flex items-start gap-2 text-xs leading-relaxed text-cyan-200/90">
                        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-cyan-300" />
                        Para proteger sua conta, você vai confirmar que este e-mail é seu por um
                        link mágico de verificação. Só depois você define a senha.
                      </p>
                    </div>
                    <div className="mt-5">
                      <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-300">
                        <Mail size={14} className="text-cyan-400" /> E-mail usado no pagamento
                      </label>
                      <input
                        type="email"
                        value={data.email}
                        onChange={set("email")}
                        placeholder="voce@exemplo.com.br"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-600 outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/15"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleSendLink}
                      disabled={sendingLink}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-400 to-cyan-400 py-4 text-sm font-bold text-slate-950 shadow-lg shadow-indigo-500/30 disabled:opacity-60"
                    >
                      {sendingLink ? (
                        <>
                          <LoaderIcon spin />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send size={17} strokeWidth={2.5} />
                          Enviar link mágico de verificação
                        </>
                      )}
                    </motion.button>
                    <a
                      href="/login"
                      className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-300"
                    >
                      <LogIn size={13} />
                      Já tenho senha — quero entrar
                    </a>
                  </div>
                )}
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  variants={stepVariant}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  {step === 0 && (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-3.5">
                        <p className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                          <Check size={14} strokeWidth={3} />
                          E-mail confirmado: {user.email}
                        </p>
                      </div>
                      <div>
                        <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-300">
                          <User size={14} className="text-cyan-400" /> Como quer ser chamado?
                        </label>
                        <input
                          type="text"
                          value={data.name}
                          onChange={set("name")}
                          placeholder="Ex: Maria"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-600 outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/15"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-300">Idade</label>
                        <input
                          type="number"
                          min="14"
                          max="120"
                          value={data.age}
                          onChange={set("age")}
                          placeholder="Ex: 25"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-600 outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/15"
                        />
                      </div>
                      <div>
                        <p className="mb-2 text-sm font-semibold text-slate-300">Gênero</p>
                        <div className="grid grid-cols-2 gap-2.5">
                          {GENDERS.map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setData((prev) => ({ ...prev, gender: g }))}
                              className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                                data.gender === g
                                  ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                                  : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-5">
                      <div>
                        <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-300">
                          <DollarSign size={14} className="text-emerald-400" /> Renda mensal
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={data.income}
                          onChange={set("income")}
                          placeholder="R$ 2.500,00"
                          className="w-full rounded-2xl border border-emerald-400/40 bg-emerald-400/[0.07] px-4 py-4 text-center text-2xl font-black tracking-tight text-emerald-300 placeholder-emerald-400/30 outline-none transition focus:border-emerald-400/80 focus:ring-4 focus:ring-emerald-400/15"
                        />
                      </div>
                      <div>
                        <p className="mb-2 text-sm font-semibold text-slate-300">
                          Principal objetivo financeiro
                        </p>
                        <div className="grid grid-cols-2 gap-2.5">
                          {GOALS.map((g) => {
                            const Icon = g.icon;
                            return (
                              <button
                                key={g.label}
                                type="button"
                                onClick={() => setData((prev) => ({ ...prev, goal: g.label }))}
                                className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition ${
                                  data.goal === g.label
                                    ? "border-emerald-400/60 bg-emerald-400/10"
                                    : "border-white/10 bg-white/5 hover:border-white/20"
                                }`}
                              >
                                <Icon
                                  size={20}
                                  className={data.goal === g.label ? "text-emerald-300" : "text-slate-400"}
                                />
                                <span
                                  className={`text-sm font-semibold ${
                                    data.goal === g.label ? "text-emerald-300" : "text-slate-300"
                                  }`}
                                >
                                  {g.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-300">
                          <Lock size={14} className="text-cyan-400" /> Criar senha de segurança
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Mínimo 8 caracteres"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-600 outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/15"
                        />
                        <div className="mt-2.5 flex items-center gap-1.5">
                          {[1, 2, 3].map((i) => (
                            <span
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                i <= strength.level ? strength.bar : "bg-white/10"
                              }`}
                            />
                          ))}
                          <span className={`ml-2 text-xs font-semibold ${strength.text}`}>
                            {password ? strength.label : ""}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-300">
                          Confirmar senha
                        </label>
                        <input
                          type="password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          placeholder="Repita a senha"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-600 outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/15"
                        />
                      </div>
                      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
                        <p className="flex items-start gap-2 text-xs leading-relaxed text-emerald-200/90">
                          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-300" />
                          E-mail verificado pelo link mágico. Sua senha só pode ser definida
                          agora, confirmando que a conta é realmente sua. Emails futuros:{" "}
                          <span className="font-semibold">{user.email}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {formError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm font-medium text-rose-400"
            >
              {formError}
            </motion.p>
          )}

          {user && (
            <div className="mt-7 flex items-center gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>
              )}
              {step < labels.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={next}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/30"
                >
                  Continuar
                  <ChevronRight size={16} className="ml-1.5 inline" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/30 disabled:opacity-60"
                >
                  {loading ? "Salvando..." : "Salvar Perfil e Acessar Meu Dashboard 🚀"}
                </motion.button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function LoaderIcon({ spin }) {
  return (
    <svg
      className={spin ? "animate-spin" : ""}
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}