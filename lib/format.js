export function formatBrlInput(value) {
  if (value == null || value === "") {
    return "";
  }
  const digits = value.replace(/\D/g, "");
  if (digits === "") {
    return "";
  }
  const cents = parseInt(digits, 10);
  const reais = Math.floor(cents / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const centavos = String(cents % 100).padStart(2, "0");
  return `R$ ${reais},${centavos}`;
}

export function brlToNumber(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) {
    return 0;
  }
  return Number(digits) / 100;
}

export function formatBRL(value, decimals = 2) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value || 0);
}

export function formatDateBR(isoDate) {
  const [year, month, day] = String(isoDate).split("-");
  if (!year || !month || !day) {
    return isoDate;
  }
  return `${day}/${month}/${year}`;
}