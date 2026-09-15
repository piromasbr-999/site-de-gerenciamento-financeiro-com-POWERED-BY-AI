import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "FinanceFlow — Assuma o controle total do seu dinheiro",
  description:
    "Controle suas entradas e saídas com gráficos intuitivos. Acesso vitalício por apenas R$ 27,00, sem mensalidades.",
  openGraph: {
    title: "FinanceFlow — Controle total do seu dinheiro",
    description:
      "Organize entradas e saídas, acompanhe gastos em gráficos claros e tome decisões inteligentes. Acesso vitalício por R$ 27,00.",
    type: "website",
    locale: "pt_BR",
    siteName: "FinanceFlow",
  },
  twitter: {
    card: "summary",
    title: "FinanceFlow — Controle total do seu dinheiro",
    description:
      "Organize entradas e saídas, acompanhe gastos em gráficos claros e tome decisões inteligentes. Acesso vitalício por R$ 27,00.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}