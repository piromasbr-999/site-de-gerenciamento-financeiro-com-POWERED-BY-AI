import { TrendingUp } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade — FinanceFlow",
  description:
    "Política de privacidade do FinanceFlow: quais dados coletamos, como usamos e seus direitos como titular (LGPD).",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#070b16] text-slate-100">
      <div className="pointer-events-none fixed -top-40 left-1/3 h-[480px] w-[760px] rounded-full bg-cyan-500/15 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <a
          href="/"
          className="mb-8 inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-white"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-slate-950 shadow-lg shadow-indigo-500/40">
            <TrendingUp size={20} strokeWidth={2.5} />
          </span>
          FinanceFlow
        </a>

        <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
          Privacidade
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-slate-500">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="text-lg font-bold text-white">1. Quais dados coletamos</h2>
            <p className="mt-2">
              Coletamos as informações que você fornece: e-mail (para criação da conta e login),
              nome, idade, gênero, renda mensal, objetivo financeiro e os lançamentos (descrição,
              categoria, valor e data) que você cadastra ou importa no painel. Os dados de
              pagamento são tratados exclusivamente pelo Mercado Pago, que é o processador —
              o FinanceFlow não armazena dados de cartão ou informações bancárias.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">2. Para que usamos</h2>
            <p className="mt-2">
              Os dados são usados para: liberar o acesso pago, autenticar você no painel,
              exibir seus lançamentos e estatísticas, e melhorar o funcionamento do produto.
              Não vendemos nem compartilhamos seus dados com terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">3. Onde ficam armazenados</h2>
            <p className="mt-2">
              Os dados são armazenados em provedores seguros de hospedagem e banco de dados na
              nuvem (Supabase, hospedado em infraestrutura Google Cloud). O acesso aos dados é
              restrito por autenticação e permissões por usuário.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">4. Segurança</h2>
            <p className="mt-2">
              Utilizamos criptografia em trânsito (HTTPS), controle de acesso por usuário e boas
              práticas de segurança no desenvolvimento. Nenhuma medida é 100% garantida, mas
              trabalhamos para proteger suas informações.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">5. Seus direitos (LGPD)</h2>
            <p className="mt-2">
              Você pode, a qualquer momento: acessar ou corrigir seus dados, exportar e excluir
              seus lançamentos e solicitar a exclusão da conta. Para exercer esses direitos,
              entre em contato pelo e-mail de suporte.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">6. Cookies</h2>
            <p className="mt-2">
              O painel utiliza autenticação por sessão armazenada localmente no seu navegador,
              necessária para o funcionamento do login. Não usamos cookies de rastreamento ou
              publicidade.
            </p>
          </section>
        </div>

        <p className="mt-12 text-center text-sm text-slate-500">
          <a href="/termos" className="font-semibold text-cyan-300 hover:underline">
            Termos de Uso
          </a>{" "}
          ·{" "}
          <a href="/" className="font-semibold text-slate-400 hover:underline">
            Voltar para o site
          </a>
        </p>
      </div>
    </main>
  );
}