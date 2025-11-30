import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function FinanceiroPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground">
          Fluxo de caixa e controle financeiro
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Saldo Atual</span>
          </div>
          <p className="mt-2 text-2xl font-bold">R$ 0,00</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-muted-foreground">Receitas</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600">R$ 0,00</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-muted-foreground">Despesas</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">R$ 0,00</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">A Receber</span>
          </div>
          <p className="mt-2 text-2xl font-bold">R$ 0,00</p>
        </div>
      </div>

      {/* Content placeholder */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold mb-4">Fluxo de Caixa</h2>
          <p className="text-muted-foreground text-center py-8">
            Grafico de fluxo de caixa sera exibido aqui
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold mb-4">Ultimas Transacoes</h2>
          <p className="text-muted-foreground text-center py-8">
            Nenhuma transacao registrada
          </p>
        </div>
      </div>
    </div>
  );
}
