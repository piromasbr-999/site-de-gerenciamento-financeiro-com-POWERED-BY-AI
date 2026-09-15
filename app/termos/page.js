import { TrendingUp } from "lucide-react";

export const metadata = {
  title: "Termos de Uso — FinanceFlow",
  description:
    "Termos de uso do FinanceFlow: condições de acesso vitalício ao painel de finanças pessoais.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#070b16] text-slate-100">
      <div className="pointer-events-none fixed -top-40 left-1/3 h-[480px] w-[760px] rounded-full bg-indigo-600/15 blur-[120px]" />

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
          Termos de Uso
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Termos de Uso</h1>
        <p className="mt-2 text-sm text-slate-500">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="text-lg font-bold text-white">1. O que é o FinanceFlow</h2>
            <p className="mt-2">
              O FinanceFlow é um painel de finanças pessoais que permite registrar entradas e
              saídas, importar extratos (OFX/CSV), acompanhar gastos por categoria e visualizar
              gráficos. O serviço é oferecido mediante pagamento único de R$ 27,00 (vinte e sete
              reais), com acesso vitalício, sem mensalidades.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">2. Liberação do acesso</h2>
            <p className="mt-2">
              Após a confirmação do pagamento via Pix, processado pelo Mercado Pago, o acesso é
              liberado automaticamente para o e-mail informado no checkout. O usuário recebe um
              link para criar a conta e o painel fica disponível enquanto o serviço estiver ativo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">3. Obrigações do usuário</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Fornecer um e-mail válido de sua titularidade no momento da compra;</li>
              <li>Não compartilhar o acesso ou utilizar o serviço de forma fraudulenta;</li>
              <li>
                Ser o responsável pelos dados financeiros que registrar, mantendo a veracidade das
                informações inseridas.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">4. Pagamento e reembolso</h2>
            <p className="mt-2">
              O pagamento é processado exclusivamente pelo Mercado Pago, respeitando os termos de
              uso da plataforma. Solicitações de reembolso podem ser enviadas para o e-mail de
              suporte e serão avaliadas caso o acesso não tenha sido entregue corretamente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">5. Disponibilidade do serviço</h2>
            <p className="mt-2">
              O acesso vitalício está sujeito à continuidade operacional do serviço e de seus
              provedores (hospedagem, banco de dados e autenticação). O FinanceFlow fará o melhor
              esforço para manter a disponibilidade, sem garantia de indisponibilidade total.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">6. Alterações nestes termos</h2>
            <p className="mt-2">
              Estes termos podem ser atualizados a qualquer momento. Mudanças relevantes serão
              comunicadas na página do produto.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white">7. Contato</h2>
            <p className="mt-2">Dúvidas sobre os termos: envie um e-mail para o suporte do FinanceFlow.</p>
          </section>
        </div>

        <p className="mt-12 text-center text-sm text-slate-500">
          <a href="/privacidade" className="font-semibold text-cyan-300 hover:underline">
            Política de Privacidade
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