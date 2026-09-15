export const RANKS = [
  { min: 0, name: "Aprendiz da Grana", iconKey: "sprout" },
  { min: 200, name: "Organizador(a)", iconKey: "clipboard" },
  { min: 500, name: "Fera do Orçamento", iconKey: "trending" },
  { min: 1000, name: "Mestre da Disciplina", iconKey: "shield" },
  { min: 1800, name: "Lenda Financeira", iconKey: "crown" },
];

export const XP_PER_TRANSACTION = 10;

function localISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function computeXP(transactions) {
  return transactions.length * XP_PER_TRANSACTION;
}

export function computeRank(xp) {
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].min) index = i;
  }
  const current = RANKS[index];
  const next = RANKS[index + 1] || null;
  const span = next ? next.min - current.min : 1;
  const progress = next
    ? Math.min(100, Math.round(((xp - current.min) / span) * 100))
    : 100;
  return { index, name: current.name, iconKey: current.iconKey, progress };
}

export function computeStreak(transactions) {
  const days = new Set(transactions.map((t) => t.date));
  if (!days.size) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = localISO(today);

  let anchor = new Date(today);
  if (!days.has(todayISO)) {
    anchor.setDate(anchor.getDate() - 1);
    if (!days.has(localISO(anchor))) return 0;
  }

  let streak = 0;
  while (days.has(localISO(anchor))) {
    streak += 1;
    anchor.setDate(anchor.getDate() - 1);
  }
  return streak;
}

export const ACHIEVEMENTS = [
  {
    id: "first",
    name: "Primeiro movimento",
    desc: "Registre sua primeira transação",
    iconKey: "plus",
    tier: 1,
  },
  {
    id: "income",
    name: "Tá chegando grana",
    desc: "Registre sua primeira entrada",
    iconKey: "inbox",
    tier: 1,
  },
  {
    id: "fifteen",
    name: "Tudo anotado",
    desc: "15 transações registradas",
    iconKey: "list",
    tier: 2,
  },
  {
    id: "fifty",
    name: "Rei do controle",
    desc: "50 transações registradas",
    iconKey: "shield",
    tier: 3,
  },
  {
    id: "hundred",
    name: "Império financeiro",
    desc: "100 transações registradas",
    iconKey: "crown",
    tier: 4,
  },
  {
    id: "saver",
    name: "Poupança ativa",
    desc: "Economize ao menos 10% da renda",
    iconKey: "piggy",
    tier: 2,
  },
  {
    id: "bigsaver",
    name: "Metade pra você",
    desc: "Economize ao menos 50% da renda",
    iconKey: "vault",
    tier: 4,
  },
  {
    id: "streak3",
    name: "Disciplina",
    desc: "Registre 3 dias seguidos",
    iconKey: "flame",
    tier: 2,
  },
  {
    id: "streak7",
    name: "Imparável",
    desc: "Registre 7 dias seguidos",
    iconKey: "fire",
    tier: 3,
  },
  {
    id: "streak14",
    name: "Duas semanas no fluxo",
    desc: "Registre 14 dias seguidos",
    iconKey: "zap",
    tier: 4,
  },
];

export function computeAchievements({ transactions, streak, savings }) {
  const count = transactions.length;
  const requirements = {
    first: count >= 1,
    income: transactions.some((t) => t.type === "income"),
    fifteen: count >= 15,
    fifty: count >= 50,
    hundred: count >= 100,
    saver: Number.isFinite(savings) && savings >= 0.1,
    bigsaver: Number.isFinite(savings) && savings >= 0.5,
    streak3: streak >= 3,
    streak7: streak >= 7,
    streak14: streak >= 14,
  };
  return ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    unlocked: Boolean(requirements[achievement.id]),
  }));
}

export function computeGame(transactions, stats) {
  const xp = computeXP(transactions);
  const rank = computeRank(xp);
  const streak = computeStreak(transactions);
  const achievements = computeAchievements({
    transactions,
    streak,
    savings: stats?.savingsRate ?? 0,
  });
  return {
    xp,
    rank,
    streak,
    achievements,
    unlockedCount: achievements.filter((a) => a.unlocked).length,
  };
}