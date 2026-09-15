"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowRightLeft,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronRight,
  Copy,
  LineChart,
  Loader2,
  Lock,
  LogIn,
  Mail,
  QrCode,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";

const PRICE = 27.0;

const EASE = [0.22, 1, 0.36, 1];

const Reveal = ({ children, delay = 0, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6, delay, ease: EASE }}
  >
    {children}
  </motion.div>
);

function Nav() {
  return (
    <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <a href="#" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-slate-950 shadow-lg shadow-indigo-500/40">
          <TrendingUp size={20} strokeWidth={2.5} />
        </span>
        FinanceFlow
      </a>
      <div className="flex items-center gap-2.5">
        <a
          href="/login"
          className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-400 transition hover:text-white sm:inline-flex"
        >
          <LogIn size={15} />
          Entrar
        </a>
        <a
          href="#checkout"
          className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/40 hover:bg-white/10 sm:inline-flex"
        >
          Quero acesso
          <ChevronRight size={16} />
        </a>
      </div>
    </header>
  );
}

function DashboardMockup() {
  const bars = [42, 68, 55, 80, 62, 92, 74, 58, 85, 70, 96, 88];

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.92, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
    >
      <div className="absolute -inset-10 rounded-full bg-gradient-to-tr from-indigo-600/40 via-purple-600/30 to-cyan-400/40 blur-3xl" />
      <div className="absolute -inset-10 rounded-[40px] bg-gradient-to-tr from-indigo-500/20 via-transparent to-cyan-400/20 blur-2xl" />

      <motion.div
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c1322]/90 shadow-2xl shadow-indigo-950/60 backdrop-blur-xl"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-1.5 border-b border-white/5 px-5 py-3.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-3 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Lock size={12} />
            financeflow.app/dashboard
          </span>
        </div>

        <div className="flex">
          <div className="hidden w-14 flex-col items-center gap-5 border-r border-white/5 py-5 sm:flex">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-slate-950">
              <BarChart3 size={17} />
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-slate-400">
              <Wallet size={16} />
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-slate-400">
              <LineChart size={16} />
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-slate-400">
              <ArrowRightLeft size={16} />
            </span>
          </div>

          <div className="flex-1 px-5 py-5 sm:px-6">
            <p className="text-xs font-medium text-slate-500">Novembro</p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-3.5">
                <p className="text-[11px] text-slate-500">Entradas</p>
                <p className="mt-1 text-sm font-bold text-emerald-400">R$ 12.400</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-3.5">
                <p className="text-[11px] text-slate-500">Saídas</p>
                <p className="mt-1 text-sm font-bold text-rose-400">R$ 8.120</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-3.5">
                <p className="text-[11px] text-slate-500">Saldo</p>
                <p className="mt-1 text-sm font-bold text-white">R$ 4.280</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/5 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-300">Fluxo de caixa</p>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <TrendingUp size={12} /> +23,4%
                </span>
              </div>
              <div className="mt-4 flex h-24 items-end gap-1.5">
                {bars.map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 origin-bottom rounded-t-md bg-gradient-to-t from-indigo-600 to-cyan-400"
                    style={{ height: `${h}%`, opacity: 0.35 + (h / 100) * 0.65 }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.7, delay: 0.5 + i * 0.06, ease: EASE }}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                <span>Jan</span>
                <span>Mar</span>
                <span>Mai</span>
                <span>Jul</span>
                <span>Set</span>
                <span>Nov</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-emerald-400/10 blur-[100px]" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-16 px-6 pb-24 pt-16 lg:grid-cols-2 lg:pt-20">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-emerald-300 sm:text-sm">
              <Sparkles size={15} className="text-emerald-300" />
              Acesso Vitalício
              <span className="text-emerald-400/60">•</span>
              Apenas R$ 27,00 (Sem mensalidades)
            </span>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Assuma o{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                controle total
              </span>{" "}
              do seu dinheiro para sempre.
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
              Organize entradas e saídas, acompanhe seus gastos em gráficos claros e tome
              decisões inteligentes — tudo em um painel simples, bonito e sem custo recorrente.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <motion.a
                href="#checkout"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-7 py-4 text-base font-bold text-slate-950 shadow-xl shadow-emerald-500/30 transition hover:shadow-2xl hover:shadow-emerald-400/40"
              >
                <Zap size={19} strokeWidth={2.5} />
                Quero meu acesso
              </motion.a>
              <a
                href="#beneficios"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-base font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10"
              >
                Ver benefícios
                <ChevronRight size={18} />
              </a>
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-4 text-sm font-semibold text-slate-500 transition hover:text-slate-200"
              >
                <LogIn size={16} />
                Já tenho conta
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={17} className="text-emerald-400" /> Compra segura
              </span>
              <span className="inline-flex items-center gap-2">
                <BadgeCheck size={17} className="text-emerald-400" /> Acesso imediato
              </span>
              <span className="inline-flex items-center gap-2">
                <Wallet size={17} className="text-emerald-400" /> Sem mensalidade
              </span>
            </div>
          </Reveal>
        </div>

        <DashboardMockup />
      </div>
    </section>
  );
}

const BENEFITS = [
  {
    icon: ArrowRightLeft,
    title: "Controle de entradas e saídas",
    text: "Cadastre receitas e despesas em segundos e veja exatamente para onde seu dinheiro está indo, sempre com visão clara do que está sobrando.",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    icon: LineChart,
    title: "Gráficos intuitivos",
    text: "Resumo visual do seu fluxo de caixa por mês, categoria e tendência — sem planilhas confusas e sem burocracia.",
    gradient: "from-indigo-400 to-cyan-500",
  },
  {
    icon: Wallet,
    title: "Custo único de R$ 27,00",
    text: "Pague uma vez e use para sempre. Sem mensalidades escondidas, sem surpresas no cartão, com acesso vitalício ao painel completo.",
    gradient: "from-amber-400 to-orange-500",
  },
];

function Benefits() {
  return (
    <section id="beneficios" className="relative mx-auto max-w-6xl scroll-mt-16 px-6 py-24">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Benefícios
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Tudo o que você precisa para <span className="text-cyan-300">dominar suas finanças</span>
          </h2>
          <p className="mt-4 text-slate-400">
            Uma ferramenta direta ao ponto, feita para quem quer clareza sobre o próprio dinheiro.
          </p>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {BENEFITS.map((benefit, i) => {
          const Icon = benefit.icon;
          return (
            <Reveal key={benefit.title} delay={i * 0.12}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-white/20"
              >
                <div
                  className={`absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${benefit.gradient} opacity-[0.08] blur-2xl transition-opacity duration-300 group-hover:opacity-20`}
                />
                <span
                  className={`inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${benefit.gradient} text-slate-950 shadow-lg`}
                >
                  <Icon size={26} strokeWidth={2.4} />
                </span>
                <h3 className="mt-6 text-lg font-bold text-white">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{benefit.text}</p>
              </motion.div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function CheckoutForm({ email, setEmail, error, loading, onSubmit }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <form onSubmit={onSubmit} noValidate>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-300">
          Seu melhor e-mail
        </label>
        <div className="relative mt-2.5">
          <Mail
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com.br"
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/60 focus:bg-white/[0.08] focus:ring-4 focus:ring-cyan-400/15"
          />
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-rose-400"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={loading ? undefined : { scale: 1.02 }}
          whileTap={loading ? undefined : { scale: 0.96 }}
          className="relative mt-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 py-4 text-base font-bold text-slate-950 disabled:cursor-not-allowed disabled:saturate-50"
        >
          <span aria-hidden className="absolute inset-0 animate-pulse rounded-2xl bg-emerald-400/50 blur-xl" />
          <span className="relative z-10 inline-flex items-center gap-2">
            {loading ? (
              <>
                <Loader2 size={19} strokeWidth={2.5} className="animate-spin" />
                Gerando Pix...
              </>
            ) : (
              <>
                <Lock size={19} strokeWidth={2.5} />
                Liberar Meu Acesso por R$ 27,00
              </>
            )}
          </span>
        </motion.button>
      </form>

      <div className="mt-5 flex items-center justify-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400" /> Pagamento 100% seguro
        </span>
        <span className="h-1 w-1 rounded-full bg-slate-700" />
        <span className="inline-flex items-center gap-1.5">
          <BadgeCheck size={14} className="text-emerald-400" /> Acesso vitalício
        </span>
      </div>
    </motion.div>
  );
}

function PixCheckout({ payment, paymentStatus, copied, onCopy, onBack }) {
  const isApproved = paymentStatus === "approved";
  const isFailed = paymentStatus === "rejected" || paymentStatus === "cancelled";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="text-center"
    >
      <div
        className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${
          isApproved
            ? "bg-emerald-400/20 text-emerald-300"
            : "bg-emerald-400/15 text-emerald-300"
        }`}
      >
        {isApproved ? <Check size={24} strokeWidth={3} /> : <QrCode size={22} />}
      </div>
      <h3 className="mt-4 text-lg font-bold text-white">
        {isApproved ? "Pagamento confirmado!" : "Escaneie o QR Code"}
      </h3>
      <p className="mt-1 text-sm text-slate-400">
        Pague <span className="font-bold text-white">R$ 27,00</span> de qualquer banco e receba
        o acesso na hora.
      </p>

      {!isApproved && (
        <div className="mx-auto mt-6 w-fit rounded-2xl bg-white p-4 shadow-2xl shadow-indigo-500/20">
          {payment.qrBase64 ? (
            <img
              src={payment.qrBase64}
              alt="QR Code Pix"
              width={192}
              height={192}
              className="h-48 w-48 select-none"
            />
          ) : (
            <QRCodeSVG
              value={payment.qrCode}
              size={192}
              level="M"
              marginSize={0}
            />
          )}
        </div>
      )}

      {!isApproved && (
        <div className="mx-auto mt-5 flex max-w-xs items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <code className="w-full select-all break-all text-center font-mono text-[11px] leading-relaxed text-slate-400">
            {payment.qrCode}
          </code>
        </div>
      )}

      {!isApproved && (
        <motion.button
          onClick={onCopy}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold transition-colors duration-300 ${
            copied
              ? "bg-emerald-400 text-slate-950"
              : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
          }`}
        >
          {copied ? (
            <>
              <Check size={19} strokeWidth={3} />
              Copiado!
            </>
          ) : (
            <>
              <Copy size={19} />
              Copiar Código Pix
            </>
          )}
        </motion.button>
      )}

      {isApproved ? (
        <div className="mt-6 flex items-center justify-center gap-2.5 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3.5 text-sm font-semibold text-emerald-300">
          <Check size={17} strokeWidth={3} />
          Pagamento confirmado! Redirecionando para sua conta...
        </div>
      ) : isFailed ? (
        <div className="mt-6 text-sm font-medium text-rose-400">
          Pagamento não identificado. Tente novamente.
        </div>
      ) : (
        <div className="mt-6 flex items-center justify-center gap-2.5 text-sm font-medium text-emerald-300">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          Aguardando pagamento...
        </div>
      )}

      <button
        onClick={onBack}
        className="mt-4 text-xs font-medium text-slate-500 underline-offset-4 transition hover:text-slate-300 hover:underline"
      >
        ← Voltar e trocar o e-mail
      </button>
    </motion.div>
  );
}

function Checkout() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form");
  const [payment, setPayment] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("pending");

  useEffect(() => {
    if (step !== "pix" || !payment) {
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/pix/status?paymentId=${payment.id}`);
        const data = await res.json();
        if (data.status) {
          setPaymentStatus(data.status);
        }
      } catch {}
    };

    checkStatus();
    const interval = setInterval(checkStatus, 15000);

    return () => clearInterval(interval);
  }, [step, payment, paymentStatus]);

  useEffect(() => {
    if (paymentStatus === "approved" && payment) {
      localStorage.setItem("financeflow_email", email.trim().toLowerCase());
      const timeout = setTimeout(() => router.push("/dashboard"), 1900);
      return () => clearTimeout(timeout);
    }
  }, [paymentStatus, payment, email, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Digite um e-mail válido para liberar o acesso.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Falha ao gerar o Pix. Tente novamente.");
      }

      setPayment({ id: data.id, qrCode: data.qrCode, qrBase64: data.qrBase64 });
      setPaymentStatus("pending");
      setStep("pix");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!payment?.qrCode) {
      return;
    }
    let ok = false;
    try {
      await navigator.clipboard.writeText(payment.qrCode);
      ok = true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = payment.qrCode;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      ok = document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  return (
    <section id="checkout" className="relative scroll-mt-16 px-6 py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/15 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-md">
        <Reveal>
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
              Checkout
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Libere seu acesso agora
            </h2>
            <p className="mt-4 text-slate-400">
              Pagamento único de <span className="font-bold text-white">R$ 27,00</span> via Pix,
              sem mensalidades e sem fidelidade.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-10 rounded-[28px] bg-gradient-to-br from-indigo-500/60 via-purple-500/40 to-cyan-400/60 p-[1.5px] shadow-2xl shadow-purple-950/40">
            <div className="rounded-[27px] bg-[#0c1222] p-7 sm:p-8">
              <div className="mb-6 flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-xl font-black text-slate-950 shadow-lg shadow-emerald-500/30">
                  R$
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-300">FinanceFlow · Acesso Vitalício</p>
                  <p className="mt-0.5 text-2xl font-black text-white">
                    R$ 27,00 <span className="text-sm font-normal text-slate-500">pagamento único</span>
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {step === "form" || !payment ? (
                  <CheckoutForm
                    key="form"
                    email={email}
                    setEmail={setEmail}
                    error={error}
                    loading={loading}
                    onSubmit={handleSubmit}
                  />
                ) : (
                  <PixCheckout
                    key="pix"
                    payment={payment}
                    paymentStatus={paymentStatus}
                    copied={copied}
                    onCopy={handleCopy}
                    onBack={() => setStep("form")}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <p className="mx-auto mt-8 max-w-sm text-center text-xs leading-relaxed text-slate-600">
            Compra protegida. Ao concluir o pagamento, seu acesso é liberado automaticamente na
            sua conta.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
        <div className="flex items-center gap-2 font-bold text-slate-300">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 text-slate-950">
            <TrendingUp size={15} strokeWidth={2.5} />
          </span>
          FinanceFlow
        </div>
        <nav className="flex items-center gap-5 text-xs font-semibold">
          <a href="/termos" className="text-slate-500 transition hover:text-slate-300">
            Termos de Uso
          </a>
          <a href="/privacidade" className="text-slate-500 transition hover:text-slate-300">
            Política de Privacidade
          </a>
        </nav>
        <p>© {new Date().getFullYear()} FinanceFlow — Acesso vitalício ao seu dinheiro.</p>
      </div>
    </footer>
  );
}

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    if (!router) return;

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session?.user) {
        router.replace("/dashboard");
      }
    });

    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          router.replace("/dashboard");
        }
      }
    );

    return () => {
      active = false;
      authSubscription?.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#070b16] text-slate-100">
      <Nav />
      <Hero />
      <Benefits />
      <Checkout />
      <Footer />
    </main>
  );
}