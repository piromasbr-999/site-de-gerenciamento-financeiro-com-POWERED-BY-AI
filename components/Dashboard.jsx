"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Calendar,
  Car,
  ClipboardList,
  Crown,
  FileUp,
  Flame,
  FlameKindling,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Home,
  Inbox,
  List,
  LogOut,
  Medal,
  Package,
  PieChart,
  PiggyBank,
  Plus,
  ShieldCheck,
  Sprout,
  Sword,
  Trash2,
  TrendingUp,
  Trophy,
  Utensils,
  Vault,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import AnimatedNumber from "@/components/AnimatedNumber";
import { formatBrlInput, brlToNumber, formatBRL, formatDateBR } from "@/lib/format";
import { parseStatementFile } from "@/lib/import";
import { computeGame } from "@/lib/gamify";
import { guessCategory } from "@/lib/categories";

const EASE = [0.22, 1, 0.36, 1];

const CATEGORIES = {
  Alimentação: { icon: Utensils, chip: "border-orange-400/20 bg-orange-400/10 text-orange-300" },
  Lazer: { icon: Gamepad2, chip: "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-300" },
  Moradia: { icon: Home, chip: "border-blue-400/20 bg-blue-400/10 text-blue-300" },
  Transporte: { icon: Car, chip: "border-slate-400/20 bg-slate-400/10 text-slate-300" },
  Saúde: { icon: HeartPulse, chip: "border-rose-400/20 bg-rose-400/10 text-rose-300" },
  Investimentos: { icon: TrendingUp, chip: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" },
  Educação: { icon: GraduationCap, chip: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300" },
  Outros: { icon: Package, chip: "border-zinc-400/20 bg-zinc-400/10 text-zinc-300" },
};

const CATEGORY_KEYS = Object.keys(CATEGORIES);

const DONUT_COLORS = {
  Alimentação: "#fb923c",
  Lazer: "#e879f9",
  Moradia: "#60a5fa",
  Transporte: "#94a3b8",
  Saúde: "#fb7185",
  Investimentos: "#34d399",
  Educação: "#22d3ee",
  Outros: "#a1a1aa",
};

const RANK_ICONS = {
  sprout: Sprout,
  clipboard: ClipboardList,
  trending: TrendingUp,
  shield: ShieldCheck,
  crown: Crown,
};

const ACHIEVEMENT_ICONS = {
  plus: Plus,
  inbox: Inbox,
  list: List,
  shield: ShieldCheck,
  crown: Crown,
  piggy: PiggyBank,
  vault: Vault,
  flame: Flame,
  fire: FlameKindling,
  zap: Zap,
};

const LEVELS = [
  { min: 0, name: "Iniciante", icon: Sprout },
  { min: 0.1, name: "Economizador", icon: TrendingUp },
  { min: 0.25, name: "Guerreiro do Orçamento", icon: Sword },
  { min: 0.4, name: "Mestre das Finanças", icon: Trophy },
];

const metricContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const metricItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

function MetricCard({ Icon, iconClass, glowClass, label, value, sub }) {
  return (
    <motion.div
      variants={metricItem}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 p-5 backdrop-blur-xl"
    >
      <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl ${glowClass}`} />
      <div className="flex items-center justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${iconClass}`}>
          <Icon size={20} strokeWidth={2.4} />
        </span>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black tracking-tight text-white">
        <AnimatedNumber value={value} />
        <span className="ml-0.5 text-base font-bold text-slate-400">R$</span>
      </p>
      {sub && <p className="mt-1.5 text-xs text-slate-500">{sub}</p>}
    </motion.div>
  );
}

export default function Dashboard({ user, profile, onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [month, setMonth] = useState("all");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [form, setForm] = useState({
    amount: "",
    description: "",
    category: "Outros",
    type: "expense",
    date: new Date().toISOString().slice(0, 10),
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [importPreview, setImportPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [celebration, setCelebration] = useState(null);
  const fileInputRef = useRef(null);
  const prevGamRef = useRef(null);

  const loadTransactions = useCallback(async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });
    if (!error) {
      setTransactions(data ?? []);
    }
    setLoadingTx(false);
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const today = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const sum = (list, typeName) =>
      list
        .filter((t) => t.type === typeName)
        .reduce((acc, t) => acc + Number(t.amount), 0);

    const monthTx = transactions.filter((t) => t.date.slice(0, 7) === thisMonth);
    const monthIncome = sum(monthTx, "income");
    const monthExp = sum(monthTx, "expense");
    const totalIncome = sum(transactions, "income");
    const totalExp = sum(transactions, "expense");

    const dailyAvg = today > 0 ? monthExp / today : 0;
    const projectedExpenses = dailyAvg * daysInMonth;
    const reserva = monthIncome - projectedExpenses;

    const monthlyIncome = Number(profile.monthly_income) || 0;
    const comprometido = monthlyIncome > 0 ? (monthExp / monthlyIncome) * 100 : 0;

    const savings = totalIncome > 0 ? Math.max(0, 1 - totalExp / totalIncome) : 0;
    const level = [...LEVELS]
      .reverse()
      .find((l) => savings >= l.min + 0.0001) ?? LEVELS[0];
    const nextLevel = LEVELS.find((l) => l.min > level.min + 0.0001);

    return {
      thisMonth,
      monthIncome,
      monthExp,
      totalIncome,
      totalExp,
      saldo: totalIncome - totalExp,
      reserva,
      monthlyIncome,
      comprometido,
      savings,
      level,
      nextLevel,
    };
  }, [transactions, profile.monthly_income]);

  const gam = useMemo(() => computeGame(transactions, stats), [transactions, stats]);

  const flowData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({
        key,
        label: `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(2)}`,
        income: 0,
        expense: 0,
      });
    }
    const totals = new Map(months.map((m) => [m.key, m]));
    transactions.forEach((t) => {
      const bucket = totals.get(t.date.slice(0, 7));
      if (bucket) bucket[t.type] = (bucket[t.type] || 0) + Number(t.amount);
    });
    return months;
  }, [transactions]);

  const catBreakdown = useMemo(() => {
    const totals = {};
    transactions.forEach((t) => {
      if (t.type === "expense" && t.date.slice(0, 7) === stats.thisMonth) {
        totals[t.category] = (totals[t.category] || 0) + Number(t.amount);
      }
    });
    return Object.entries(totals)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, stats.thisMonth]);
  const catTotal = catBreakdown.reduce((acc, c) => acc + c.value, 0);

  const celebrate = useCallback((payload) => {
    setCelebration(payload);
    confetti({
      particleCount: 150,
      startVelocity: 48,
      spread: 85,
      origin: { y: 0.62 },
      colors: ["#f59e0b", "#fbbf24", "#34d399", "#22d3ee", "#a78bfa"],
    });
  }, []);

  useEffect(() => {
    if (loadingTx) return;
    if (!prevGamRef.current) {
      prevGamRef.current = {
        rank: gam.rank.index,
        unlocked: new Set(gam.achievements.filter((a) => a.unlocked).map((a) => a.id)),
      };
      return;
    }
    const prev = prevGamRef.current;
    const newlyUnlocked = gam.achievements.find(
      (a) => a.unlocked && !prev.unlocked.has(a.id)
    );
    if (gam.rank.index > prev.rank) {
      celebrate({ kind: "rank", rank: gam.rank });
    } else if (newlyUnlocked) {
      celebrate({ kind: "achievement", achievement: newlyUnlocked });
    }
    prevGamRef.current = {
      rank: gam.rank.index,
      unlocked: new Set(gam.achievements.filter((a) => a.unlocked).map((a) => a.id)),
    };
  }, [gam, loadingTx, celebrate]);

  useEffect(() => {
    if (!celebration) return;
    const timeout = setTimeout(() => setCelebration(null), 3800);
    return () => clearTimeout(timeout);
  }, [celebration]);

  const visible = transactions.filter((t) => {
    if (month !== "all" && t.date.slice(0, 7) !== month) return false;
    if (type !== "all" && t.type !== type) return false;
    if (category !== "all" && t.category !== category) return false;
    return true;
  });

  const monthOptions = useMemo(() => {
    const set = new Set(transactions.map((t) => t.date.slice(0, 7)));
    return [...set].sort().reverse();
  }, [transactions]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const amount = brlToNumber(form.amount);
    if (amount <= 0) {
      setFormError("Informe um valor válido.");
      return;
    }
    if (!form.description.trim()) {
      setFormError("Descreva a transação.");
      return;
    }
    setFormError("");
    setSubmitLoading(true);

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      description: form.description.trim(),
      amount,
      type: form.type,
      category: form.category,
      date: form.date,
    });

    setSubmitLoading(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    confetti({
      particleCount: form.type === "income" ? 130 : 70,
      startVelocity: 45,
      spread: 70,
      origin: { y: 0.65 },
      colors: ["#34d399", "#22d3ee", "#a78bfa", "#f472b6"],
    });

    setForm((f) => ({ ...f, amount: "", description: "" }));
    loadTransactions();
  };

  const handleDelete = async (id) => {
    await supabase.from("transactions").delete().eq("id", id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseStatementFile(text);
      if (!parsed.rows.length) {
        setImportPreview({
          error:
            "Não encontramos transações legíveis neste arquivo. Confira se é um extrato OFX ou CSV.",
        });
      } else {
        setImportPreview({
          ...parsed,
          rows: parsed.rows.map((r) => ({
            ...r,
            category: guessCategory(r.description),
          })),
        });
      }
    } catch (err) {
      setImportPreview({
        error: err.message || "Não foi possível ler o arquivo. Tente outro extrato.",
      });
    }
  };

  const handleImport = async () => {
    if (!importPreview?.rows?.length || importing) return;

    const existing = new Set(
      transactions.map((t) =>
        `${t.date}|${t.type}|${Number(t.amount).toFixed(2)}|${(t.description || "").trim().toLowerCase()}`
      )
    );
    const fresh = importPreview.rows.filter((r) => {
      const key = `${r.date}|${r.type}|${r.amount.toFixed(2)}|${r.description.trim().toLowerCase()}`;
      return !existing.has(key);
    });

    if (!fresh.length) {
      setImportPreview({
        error: "Todas as transações deste arquivo já estão registradas.",
      });
      return;
    }

    setImporting(true);
    const { error } = await supabase.from("transactions").insert(
      fresh.map((r) => ({
        user_id: user.id,
        description: r.description,
        amount: r.amount,
        type: r.type,
        category: r.category || "Outros",
        date: r.date,
      }))
    );
    setImporting(false);

    if (error) {
      setImportPreview({ error: error.message });
      return;
    }

    confetti({
      particleCount: fresh.length > 10 ? 160 : fresh.length > 3 ? 130 : 90,
      startVelocity: 50,
      spread: 110,
      origin: { y: 0.6 },
      colors: ["#34d399", "#22d3ee", "#a78bfa", "#f472b6"],
    });
    setImportPreview(null);
    loadTransactions();
  };

  const firstName = (profile.name || "").trim().split(" ")[0] || "investidor";
  const pct = Math.max(0, Math.min(stats.comprometido, 100));
  const chartMax = Math.max(1, ...flowData.flatMap((d) => [d.income, d.expense]));

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#070b16] text-slate-100">
      <div className="pointer-events-none fixed -top-40 left-1/3 h-[480px] w-[760px] rounded-full bg-emerald-500/[0.08] blur-[120px]" />
      <div className="pointer-events-none fixed right-0 top-1/3 h-72 w-72 rounded-full bg-rose-500/[0.08] blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-8 sm:py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Olá, {firstName}!
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-bold text-emerald-300">
                <stats.level.icon size={14} />
                Nível: {stats.level.name}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Seu objetivo: <span className="font-semibold text-slate-200">{profile.financial_goal || "Organizar gastos"}</span>
            </p>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-rose-400/30 hover:text-rose-300"
          >
            <LogOut size={15} />
            Sair
          </button>
        </header>

        <motion.section
          variants={metricContainer}
          initial="hidden"
          animate="show"
          className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]"
        >
          <motion.div
            variants={metricItem}
            whileHover={{ y: -3 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/[0.1] to-cyan-400/[0.05] p-5 backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-indigo-500/20 blur-2xl" />
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Sua missão
                </p>
                <p className="mt-1 truncate text-lg font-black text-white">
                  {gam.rank.name}
                </p>
              </div>
              {(() => {
                const RankIcon = RANK_ICONS[gam.rank.iconKey] ?? Trophy;
                return (
                  <motion.span
                    key={gam.rank.iconKey}
                    initial={{ scale: 0, rotate: -14 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16 }}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-400 to-cyan-400 text-slate-950 shadow-lg shadow-indigo-500/30"
                  >
                    <RankIcon size={22} strokeWidth={2.4} />
                  </motion.span>
                );
              })()}
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: `${gam.rank.progress}%` }}
                transition={{ duration: 0.9, ease: EASE }}
              />
            </div>
            <p className="mt-2 text-[11px] font-medium text-slate-500">
              {gam.xp} XP
              {gam.rank.progress >= 100
                ? " · Nível máximo"
                : ` · ${100 - gam.rank.progress}% para o próximo`}
            </p>
            <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-orange-400/20 bg-orange-400/10 px-3.5 py-2.5">
              <Flame size={18} className="text-orange-400" />
              <span className="text-sm font-bold text-orange-300">
                {gam.streak} {gam.streak === 1 ? "dia" : "dias"} seguidos
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={metricItem}
            className="rounded-3xl border border-white/10 bg-zinc-900/50 p-5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-bold text-white">
                <Medal size={16} className="text-amber-400" />
                Conquistas
              </p>
              <span className="text-xs font-semibold text-slate-400">
                {gam.unlockedCount}/{gam.achievements.length}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {gam.achievements.map((a) => {
                const AchIcon = ACHIEVEMENT_ICONS[a.iconKey] ?? Trophy;
                return (
                  <motion.div
                    key={a.id}
                    title={`${a.name} — ${a.desc}`}
                    whileHover={{ scale: 1.04 }}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-center transition ${
                      a.unlocked
                        ? "border-amber-400/25 bg-amber-400/[0.08]"
                        : "border-white/5 bg-white/[0.02] opacity-50"
                    }`}
                  >
                    <AchIcon
                      size={18}
                      className={a.unlocked ? "text-amber-400" : "text-slate-600"}
                    />
                    <p className="text-[10px] font-bold leading-tight text-slate-300">
                      {a.name}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-7 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-300">
              {stats.comprometido <= 100
                ? `Você comprometeu apenas ${pct.toFixed(0)}% da sua Renda de R$ ${formatBRL(stats.monthlyIncome)} este mês!`
                : `Cuidado! Você já comprometeu ${pct.toFixed(0)}% da sua Renda de R$ ${formatBRL(stats.monthlyIncome)} este mês.`}
            </p>
            <span className="text-xs font-bold text-slate-400">
              {stats.savings >= 0.25 ? "Meta de economia alcançada!" : ""}
            </span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className={`h-full rounded-full ${
                stats.comprometido <= 50
                  ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                  : stats.comprometido <= 80
                    ? "bg-gradient-to-r from-amber-400 to-orange-400"
                    : "bg-gradient-to-r from-rose-500 to-pink-500"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: EASE }}
            />
          </div>
          {stats.nextLevel && (
            <p className="mt-3 text-xs text-slate-500">
              Economize mais {(stats.nextLevel.min - stats.savings).toFixed(0) >= 0
                ? `${Math.round((stats.nextLevel.min - stats.savings) * 100)}%`
                : "0%"}{" "}
              da sua renda para alcançar <span className="font-semibold text-slate-300">{stats.nextLevel.name}</span>.
            </p>
          )}
        </motion.section>

        <motion.section
          variants={metricContainer}
          initial="hidden"
          animate="show"
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <MetricCard
            Icon={Wallet}
            iconClass="bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950"
            glowClass="bg-emerald-400/20"
            label="Saldo Total"
            value={stats.saldo}
            sub="Entradas menos saídas de todos os meses"
          />
          <MetricCard
            Icon={ArrowDownToLine}
            iconClass="bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950"
            glowClass="bg-emerald-400/20"
            label="Receitas"
            value={stats.monthIncome}
            sub={`Entradas + renda fixa · ${stats.thisMonth.slice(5, 7)}/${stats.thisMonth.slice(0, 4)}`}
          />
          <MetricCard
            Icon={ArrowUpFromLine}
            iconClass="bg-gradient-to-br from-rose-500 to-pink-500 text-slate-950"
            glowClass="bg-rose-500/20"
            label="Despesas"
            value={stats.monthExp}
            sub={`${stats.monthlyIncome ? Math.round((stats.monthExp / stats.monthlyIncome) * 100) : 0}% da sua renda`}
          />
          <MetricCard
            Icon={PiggyBank}
            iconClass="bg-gradient-to-br from-cyan-400 to-sky-500 text-slate-950"
            glowClass="bg-cyan-400/20"
            label="Reserva Estimada"
            value={stats.reserva}
            sub="Previsão de sobra ao fim do mês"
          />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
          className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]"
        >
          <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-white">
                <BarChart3 size={17} className="text-emerald-400" />
                Fluxo de caixa
              </h2>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  Entradas
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  Saídas
                </span>
              </div>
            </div>

            {flowData.every((d) => d.income === 0 && d.expense === 0) ? (
              <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 p-10 text-center">
                <BarChart3 size={26} className="text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">Sem dados ainda</p>
                <p className="text-xs text-slate-600">
                  Cadastre ou importe transações para ver o gráfico.
                </p>
              </div>
            ) : (
              <div className="mt-6 flex items-end gap-5">
                {flowData.map((m, i) => (
                  <div key={m.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div className="flex h-[180px] w-full items-end justify-center gap-1.5">
                      <motion.div
                        className="w-3.5 rounded-t-md bg-gradient-to-t from-emerald-400 to-teal-300"
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(3, (m.income / chartMax) * 100)}%` }}
                        transition={{ duration: 0.7, delay: 0.3 + i * 0.08, ease: EASE }}
                      />
                      <motion.div
                        className="w-3.5 rounded-t-md bg-gradient-to-t from-rose-500 to-pink-400"
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(3, (m.expense / chartMax) * 100)}%` }}
                        transition={{ duration: 0.7, delay: 0.35 + i * 0.08, ease: EASE }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">{m.label}</span>
                    {(m.income > 0 || m.expense > 0) && (
                      <span className="text-[10px] font-bold text-slate-600">
                        R$ {Math.max(m.income, m.expense).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-xl">
            <h2 className="flex items-center gap-2 text-base font-bold text-white">
              <PieChart size={17} className="text-cyan-400" />
              Gastos por categoria
            </h2>
            <p className="mt-1 text-[11px] text-slate-500">
              Saídas de {stats.thisMonth.slice(5, 7)}/{stats.thisMonth.slice(0, 4)}
            </p>

            {catTotal > 0 ? (
              <>
                <div className="relative mx-auto mt-5 h-36 w-36">
                  <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                    <circle
                      cx="60"
                      cy="60"
                      r="46"
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="13"
                      pathLength="100"
                    />
                    {(() => {
                      let accum = 0;
                      return catBreakdown.map((c) => {
                        const seg = { ...c, pct: (c.value / catTotal) * 100, offset: accum };
                        accum += (c.value / catTotal) * 100;
                        return (
                          <circle
                            key={c.category}
                            cx="60"
                            cy="60"
                            r="46"
                            fill="none"
                            stroke={DONUT_COLORS[c.category] ?? "#a1a1aa"}
                            strokeWidth="13"
                            pathLength="100"
                            strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                            strokeDashoffset={-seg.offset}
                            className="transition-all duration-700"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-center">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Total
                      </p>
                      <p className="text-base font-black text-white">
                        R$ {formatBRL(catTotal)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 max-h-44 space-y-2 overflow-y-auto pr-1">
                  {catBreakdown.map((c) => (
                    <div key={c.category} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: DONUT_COLORS[c.category] ?? "#a1a1aa" }}
                      />
                      <span className="min-w-0 flex-1 truncate font-semibold text-slate-300">
                        {c.category}
                      </span>
                      <span className="shrink-0 font-bold text-slate-200">
                        R$ {formatBRL(c.value)}
                      </span>
                      <span className="w-9 shrink-0 text-right text-slate-500">
                        {((c.value / catTotal) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 p-8 text-center">
                <PieChart size={26} className="text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">Nada gasto ainda</p>
                <p className="text-xs text-slate-600">
                  As despesas do mês aparecem aqui.
                </p>
              </div>
            )}
          </div>
        </motion.section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
            className="h-fit rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-xl"
          >
            <h2 className="flex items-center gap-2 text-base font-bold text-white">
              <Plus size={17} className="text-emerald-400" />
              Nova Transação
            </h2>

            <form onSubmit={handleAdd} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: "expense" }))}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    form.type === "expense"
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Saída
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: "income" }))}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    form.type === "income"
                      ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Entrada
                </button>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Valor</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: formatBrlInput(e.target.value) }))}
                  placeholder="R$ 0,00"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-600 outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/15"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Descrição</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Ex: Aluguel, salário, delivery..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-600 outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/15"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Categoria</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-[#0c1222] px-3.5 py-3.5 text-sm text-white outline-none transition focus:border-cyan-400/60"
                  >
                    {CATEGORY_KEYS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Data</label>
                  <div className="relative">
                    <Calendar size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-cyan-400/60 [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {formError && (
                <p className="text-sm font-medium text-rose-400">{formError}</p>
              )}

              <motion.button
                type="submit"
                disabled={submitLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className={`w-full rounded-2xl py-3.5 text-sm font-bold text-slate-950 shadow-lg transition ${
                  form.type === "income"
                    ? "bg-gradient-to-r from-emerald-400 to-cyan-500 shadow-emerald-500/30"
                    : "bg-gradient-to-r from-rose-400 to-pink-500 shadow-rose-500/30"
                } disabled:opacity-60`}
              >
                {submitLoading ? "Salvando..." : "Adicionar transação"}
              </motion.button>
            </form>

            <div className="mt-5 border-t border-white/10 pt-5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".ofx,.csv,.txt"
                className="hidden"
                onChange={handleFileSelected}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300"
              >
                <FileUp size={17} />
                Importar extrato (OFX / CSV)
              </button>
              <p className="mt-2 text-center text-[11px] text-slate-600">
                Importe extratos do seu banco ou continue cadastrando manualmente.
              </p>

              <AnimatePresence initial={false}>
                {importPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: 8 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    {importPreview.error ? (
                      <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">
                        <p className="text-sm text-rose-300">{importPreview.error}</p>
                        <button
                          onClick={() => setImportPreview(null)}
                          className="mt-3 text-xs font-semibold text-rose-400 hover:text-rose-300"
                        >
                          Fechar
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                            {importPreview.format.toUpperCase()} · {importPreview.rows.length} transações
                          </p>
                          <button
                            onClick={() => setImportPreview(null)}
                            aria-label="Fechar prévia"
                            className="text-slate-500 transition hover:text-slate-300"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        <div className="mt-3 space-y-1.5">
                          {importPreview.rows.slice(0, 4).map((r, i) => {
                            const PreviewIcon = r.type === "income" ? ArrowDownToLine : ArrowUpFromLine;
                            return (
                              <div
                                key={i}
                                className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-2.5 py-1.5"
                              >
                                <PreviewIcon
                                  size={13}
                                  className={r.type === "income" ? "text-emerald-400" : "text-rose-400"}
                                />
                                <span className="min-w-0 flex-1 truncate text-xs text-slate-300">
                                  {r.description}
                                </span>
                                <span className="shrink-0 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                                  {r.category || "Outros"}
                                </span>
                                <span className="shrink-0 text-[10px] text-slate-500">{formatDateBR(r.date)}</span>
                                <span
                                  className={`shrink-0 text-xs font-bold ${
                                    r.type === "income" ? "text-emerald-400" : "text-rose-400"
                                  }`}
                                >
                                  {r.type === "income" ? "+" : "−"} R$ {formatBRL(r.amount)}
                                </span>
                              </div>
                            );
                          })}
                          {importPreview.rows.length > 4 && (
                            <p className="text-[11px] text-slate-500">
                              +{importPreview.rows.length - 4} outras...
                            </p>
                          )}
                        </div>

                        <button
                          onClick={handleImport}
                          disabled={importing}
                          className={`mt-4 w-full rounded-xl py-2.5 text-sm font-bold transition disabled:opacity-60 ${
                            importing
                              ? "bg-white/5 text-slate-400"
                              : "bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 hover:brightness-110"
                          }`}
                        >
                          {importing ? "Importando..." : "Adicionar tudo"}
                        </button>
                        {importPreview.rows.length > 0 && (
                          <p className="mt-2 text-center text-[11px] text-slate-500">
                            Duplicadas são ignoradas automaticamente.
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: EASE }}
            className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-xl"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-white">
                <PiggyBank size={17} className="text-rose-400" />
                Histórico de Transações
              </h2>

              <div className="flex flex-wrap gap-2">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#0c1222] px-3 py-2 text-xs font-semibold text-slate-300 outline-none focus:border-cyan-400/60"
                >
                  <option value="all">Todos os meses</option>
                  {monthOptions.map((m) => (
                    <option key={m} value={m}>
                      {m.slice(5, 7)}/{m.slice(0, 4)}
                    </option>
                  ))}
                </select>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#0c1222] px-3 py-2 text-xs font-semibold text-slate-300 outline-none focus:border-cyan-400/60"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="income">Entradas</option>
                  <option value="expense">Saídas</option>
                </select>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#0c1222] px-3 py-2 text-xs font-semibold text-slate-300 outline-none focus:border-cyan-400/60"
                >
                  <option value="all">Todas as categorias</option>
                  {CATEGORY_KEYS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              {loadingTx ? (
                <div className="space-y-2.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/[0.05]" />
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
                  <Wallet size={28} className="mx-auto text-slate-600" />
                  <p className="mt-3 text-sm font-semibold text-slate-400">Nenhuma transação aqui ainda</p>
                  <p className="mt-1 text-xs text-slate-600">Adicione a primeira no formulário ao lado.</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {visible.map((t) => {
                    const cat = CATEGORIES[t.category] ?? CATEGORIES.Outros;
                    const CatIcon = cat.icon;
                    return (
                      <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 48 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3.5 transition hover:border-white/10"
                      >
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${cat.chip}`}>
                          <CatIcon size={17} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-200">
                            {t.description}
                          </p>
                          <p className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                            <span>{formatDateBR(t.date)}</span>
                            <span>·</span>
                            <span>{t.category}</span>
                          </p>
                        </div>
                        <p
                          className={`shrink-0 text-sm font-black ${
                            t.type === "income" ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {t.type === "income" ? "+" : "−"} R$ {formatBRL(t.amount)}
                        </p>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleDelete(t.id)}
                          aria-label="Excluir transação"
                          className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 transition hover:bg-rose-500/10 hover:text-rose-400"
                        >
                          <Trash2 size={15} />
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </motion.section>
        </div>
      </div>

      <AnimatePresence>
        {celebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCelebration(null)}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.7, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#141b31] to-[#0c1222] p-8 text-center shadow-2xl"
            >
              <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-indigo-500/30 blur-3xl" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCelebration(null);
                }}
                aria-label="Fechar"
                className="absolute right-3 top-3 text-slate-500 transition hover:text-slate-300"
              >
                <X size={16} />
              </button>

              {(() => {
                const iconKey =
                  celebration.kind === "rank"
                    ? celebration.rank.iconKey
                    : celebration.achievement.iconKey;
                const Icon = celebration.kind === "rank"
                  ? RANK_ICONS[iconKey] ?? Trophy
                  : ACHIEVEMENT_ICONS[iconKey] ?? Trophy;
                return (
                  <motion.span
                    initial={{ rotate: -14, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 14 }}
                    className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-xl shadow-amber-500/40"
                  >
                    <Icon size={30} strokeWidth={2.4} />
                  </motion.span>
                );
              })()}

              <p className="mt-5 text-xs font-bold uppercase tracking-widest text-amber-400">
                {celebration.kind === "rank"
                  ? "Você subiu de nível"
                  : "Conquista desbloqueada"}
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">
                {celebration.kind === "rank" ? celebration.rank.name : celebration.achievement.name}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                {celebration.kind === "rank"
                  ? `Você já acumulou ${gam.xp} XP. Continue assim, o próximo nível está logo ali.`
                  : celebration.achievement.desc}
              </p>
              <p className="mt-5 text-xs font-semibold text-slate-500">
                Toque em qualquer lugar para continuar
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}