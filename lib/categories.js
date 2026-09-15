const RULES = [
  {
    category: "Alimentação",
    keywords: [
      "mercado",
      "supermercado",
      "padaria",
      "acougue",
      "hortifruti",
      "sacolao",
      "feira",
      "restaurante",
      "lanchonete",
      "ifood",
      "ubereats",
      "uber eats",
      "99food",
      "delivery",
      "lanche",
      "hamburg",
      "pizza",
      "sushi",
      "almoco",
      "jantar",
      "cafe",
      "lanch",
      "bebida",
      "comida",
      "quitanda",
      "conveniencia",
    ],
  },
  {
    category: "Transporte",
    keywords: [
      "uber",
      " 99 ",
      "taxi",
      "combustivel",
      "posto",
      "gasolina",
      "etanol",
      "estacionamento",
      "pedagio",
      "onibus",
      "metro",
      "conducao",
      "vale transporte",
      "bicicleta",
      "aplicativo de transporte",
      "recarga dobilidade",
      "cartao transporte",
    ],
  },
  {
    category: "Saúde",
    keywords: [
      "farmacia",
      "medico",
      "consulta",
      "dentista",
      "hospital",
      "remedio",
      "exame",
      "plano de saude",
      "clinica",
      "psicologo",
      "academia",
      "suplemento",
      "vitamina",
      "fisioterapia",
      "vacina",
    ],
  },
  {
    category: "Moradia",
    keywords: [
      "aluguel",
      "condominio",
      "iptu",
      "conta de luz",
      "conta de agua",
      "conta de gas",
      "energia",
      "agua",
      "gas",
      "internet",
      "telefone",
      "celular",
      "operadora",
      "ipva",
      "reforma",
      "moveis",
      "eletrodomestico",
    ],
  },
  {
    category: "Investimentos",
    keywords: [
      "investimento",
      "investir",
      "tesouro",
      "acao",
      "acoes",
      "b3",
      "cdb",
      "lci",
      "lca",
      "renda fixa",
      "fundo",
      "bitcoin",
      "cripto",
      "caixinha",
      "nuinvest",
      "rendimento",
    ],
  },
  {
    category: "Educação",
    keywords: [
      "escola",
      "faculdade",
      "curso",
      "mensalidade",
      "livro",
      "alura",
      "udemy",
      "coursera",
      "idioma",
      "ingles",
      "reforco",
      "aula",
      "ebook",
      "e-book",
      "assinatura educacao",
    ],
  },
  {
    category: "Lazer",
    keywords: [
      "netflix",
      "spotify",
      "cinema",
      "streaming",
      "playstation",
      "xbox",
      "steam",
      "jogo",
      "game",
      "show",
      "festa",
      "ingresso",
      "evento",
      "hobby",
      "viagem",
      "hotel",
      "passagem",
      "bar",
      "cafe da manha forado",
      "emprestimo de lazer",
    ],
  },
];

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function guessCategory(description) {
  const text = normalizeText(description);
  if (
    text.includes("mercado pago") ||
    text.includes("mercadopago") ||
    text.includes("pix") ||
    text.includes("transferencia")
  ) {
    return "Outros";
  }
  for (const rule of RULES) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      return rule.category;
    }
  }
  return "Outros";
}