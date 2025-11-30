import { CheckSquare, Plus, Filter } from "lucide-react";

export default function AcoesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Acoes</h1>
          <p className="text-muted-foreground">
            Kanban board com todas as acoes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
            <Filter className="h-4 w-4" />
            Filtros
          </button>
          <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Nova Acao
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KanbanColumn title="A Fazer" count={0} />
        <KanbanColumn title="Em Progresso" count={0} />
        <KanbanColumn title="Em Revisao" count={0} />
        <KanbanColumn title="Concluido" count={0} />
      </div>
    </div>
  );
}

function KanbanColumn({ title, count }: { title: string; count: number }) {
  return (
    <div className="rounded-lg border bg-muted/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">{title}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
          {count}
        </span>
      </div>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckSquare className="h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Nenhuma acao
        </p>
      </div>
    </div>
  );
}
