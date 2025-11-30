import { Boxes, ArrowDownUp, AlertTriangle } from "lucide-react";

export default function EstoquePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground">
            Controle de estoque e movimentacoes
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <ArrowDownUp className="h-4 w-4" />
          Nova Movimentacao
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Total de Itens</span>
          </div>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <ArrowDownUp className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Movimentacoes Hoje</span>
          </div>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-yellow-50 p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-700">Estoque Baixo</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-yellow-700">0</p>
        </div>
      </div>

      {/* Table placeholder */}
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground text-center py-8">
          Nenhuma movimentacao registrada
        </p>
      </div>
    </div>
  );
}
