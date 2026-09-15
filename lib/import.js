const pad = (n) => String(n).padStart(2, "0");

function validISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return iso;
}

function parseOFXDate(raw) {
  const match = String(raw ?? "").match(/(\d{4})(\d{2})(\d{2})/);
  if (!match) return null;
  return validISO(`${match[1]}-${match[2]}-${match[3]}`);
}

function parseCsvDate(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;

  const iso = s.match(/(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
  if (iso) {
    return validISO(`${iso[1]}-${pad(iso[2])}-${pad(iso[3])}`);
  }

  const br = s.match(/(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})/);
  if (br) {
    let year = br[3];
    if (year.length === 2) year = Number(year) > 50 ? `19${year}` : `20${year}`;
    return validISO(`${year}-${pad(br[2])}-${pad(br[1])}`);
  }

  return null;
}

function normalizeAmount(raw) {
  if (raw == null) return 0;
  let s = String(raw).trim().replace(/["' ]/g, "");
  if (s === "") return 0;

  const negative =
    /^\(.*\)$/.test(s) ||
    /^-/.test(s);

  s = s.replace(/R\s*\$/, "").replace(/[$]/g, "");

  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  let value;

  if (lastComma === -1 && lastDot === -1) {
    value = parseFloat(s);
  } else {
    const sep = lastComma > lastDot ? "," : ".";
    const decimalIdx = sep === "," ? lastComma : lastDot;
    if (decimalIdx >= 0 && s.length - decimalIdx - 1 === 2) {
      const minusThousands = s.replace(sep === "," ? /\./g : /,/g, "");
      const cleaned = minusThousands.replace(sep, ".");
      value = parseFloat(cleaned);
    } else {
      value = parseFloat(s.replace(/[.,]/g, ""));
    }
  }

  if (Number.isNaN(value)) return 0;
  return Math.abs(value) * (negative ? -1 : 1);
}

function normalizeOFXAmount(raw) {
  const value = Number(String(raw ?? "").replace(",", "."));
  if (Number.isNaN(value)) return 0;
  return value;
}

function parseOFX(text) {
  const rows = [];
  const blocks = text
    .split(/<\/?STMTTRN>/i)
    .filter((_, i) => i % 2 === 1 && _.trim());

  for (const block of blocks) {
    const get = (key) => {
      const match = block.match(new RegExp(`<${key}[^>]*>([^<]*)<`, "i"));
      return match ? match[1].trim() : "";
    };

    const amountRaw = get("TRNAMT");
    const amount = normalizeOFXAmount(amountRaw);
    if (amount === 0) continue;

    const date = parseOFXDate(get("DTPOSTED") || get("DTUSER"));
    if (!date) continue;

    const description =
      (get("MEMO") || get("NAME") || get("PAYEE") || "")
        .replace(/&amp;/g, "&")
        .trim() || "Transação importada";

    const trntype = get("TRNTYPE").toUpperCase();
    const isFlatPositive = /^(CREDIT|DEP|DIRECTDEP)$/.test(trntype);
    const isFlatNegative = /^(DEBIT|POS|ATM|CHARGE|FEE)$/.test(trntype);

    let type;
    if (isFlatPositive) type = "income";
    else if (isFlatNegative) type = "expense";
    else type = amount >= 0 ? "income" : "expense";

    const normalizedDate = parseCsvDate(date);
    if (!normalizedDate) continue;

    rows.push({
      date: normalizedDate,
      description,
      amount: Math.abs(amount),
      type,
    });
  }

  return { format: "ofx", rows };
}

function parseCSVLine(line, delimiter) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      cells.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function detectDelimiter(lines) {
  const sample = lines.slice(0, 6).join("\n").replace(/"[^"]*"/g, "");
  const semis = (sample.match(/;/g) || []).length;
  const commas = (sample.match(/,/g) || []).length;
  if (semis && semis >= commas) return ";";
  return ",";
}

function findHeaderIndex(matrix) {
  for (let i = 0; i < Math.min(5, matrix.length); i++) {
    const joined = matrix[i].join(" ").toLowerCase();
    if (
      /(data|date|dia)|(valor|amount|cred|deb)|(descri|mem|text|legend|histo)/.test(
        joined
      )
    ) {
      return i;
    }
  }
  return null;
}

function detectHeaderColumns(matrix, headerIndex) {
  const names = (matrix[headerIndex] || []).map((h) =>
    String(h).toLowerCase()
  );
  const find = (regex) => names.findIndex((name) => regex.test(name));

  const cols = {
    date: find(/data|date|dia|lan/),
    amount: find(/valor|amount/),
    type: find(/tipo|type|class|entr|sa[íi]da/),
    description: -1,
  };

  const used = new Set(
    [cols.date, cols.amount, cols.type].filter((c) => c >= 0)
  );

  for (let i = 0; i < names.length; i++) {
    if (used.has(i)) continue;
    if (/descri|mem|text|legend|histo|conceit|nome|detalh/.test(names[i])) {
      cols.description = i;
      break;
    }
  }

  if (cols.description === -1) {
    for (let i = 0; i < names.length; i++) {
      if (used.has(i)) continue;
      if (!/saldo|ident|id|c[óo]d/.test(names[i])) {
        cols.description = i;
        break;
      }
    }
  }

  return cols;
}

function guessColumns(matrix, start) {
  const nCols = Math.max(...matrix.map((row) => row.length), 0);
  const tallies = { date: [], amount: [], text: [] };

  for (let c = 0; c < nCols; c++) {
    let date = 0;
    let amount = 0;
    let text = 0;
    for (
      let r = start;
      r < Math.min(start + 20, matrix.length);
      r++
    ) {
      const value = matrix[r][c] ?? "";
      if (value === "") continue;
      if (parseCsvDate(value)) date += 1;
      else if (normalizeAmount(value) !== 0) amount += 1;
      else text += 1;
    }
    tallies.date.push(date);
    tallies.amount.push(amount);
    tallies.text.push(text);
  }

  const argmax = (arr) => {
    let best = -1;
    let bestValue = 0;
    arr.forEach((value, i) => {
      if (value > bestValue) {
        bestValue = value;
        best = i;
      }
    });
    return bestValue > 0 ? best : null;
  };

  const date = argmax(tallies.date);
  let amount = argmax(tallies.amount);
  if (amount === date) amount = null;
  let description = argmax(tallies.text);
  if (description === date || description === amount) description = null;
  if (description === null || description === undefined) {
    description = [0, 1, 2].find(
      (c) => c !== date && c !== amount
    );
  }

  return { date, amount, description, type: null };
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { format: "csv", rows: [] };

  const delimiter = detectDelimiter(lines);
  const matrix = lines.map((line) => parseCSVLine(line, delimiter));

  const headerIndex = findHeaderIndex(matrix);
  const dataStart = headerIndex == null ? 0 : headerIndex + 1;
  const cols = headerIndex == null
    ? guessColumns(matrix, dataStart)
    : detectHeaderColumns(matrix, headerIndex);

  const rows = [];
  for (let r = dataStart; r < matrix.length; r++) {
    const cells = matrix[r];
    const get = (c) => (c != null && c >= 0 ? cells[c] ?? "" : "");

    const date = parseCsvDate(get(cols.date));
    if (!date) continue;

    const signedAmount = normalizeAmount(get(cols.amount));
    if (signedAmount === 0) continue;
    const amount = Math.abs(signedAmount);

    let type = null;
    const rawType = get(cols.type)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (cols.type != null && rawType) {
      if (/(sai|deb|pagament|negativ|expense)/.test(rawType)) {
        type = "expense";
      } else if (/(entr|cred|receit|income|deposit|posit)/.test(rawType)) {
        type = "income";
      }
    }
    if (!type) {
      type = signedAmount < 0 ? "expense" : "income";
    }

    let description = get(cols.description).trim();
    if (!description) {
      description = cells
        .filter((_, i) => i !== cols.date && i !== cols.amount && i !== cols.type)
        .join(" ")
        .trim();
    }
    if (!description) description = "Transação importada";

    rows.push({ date, description, amount, type });
  }

  return { format: "csv", rows };
}

export function parseStatementFile(content) {
  const text = String(content ?? "").trim();
  if (!text) return { format: "unknown", rows: [] };

  if (/<OFX>|<STMTTRN>/i.test(text.slice(0, 4000))) {
    return parseOFX(text);
  }

  return parseCSV(text);
}