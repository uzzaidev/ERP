import { Plus, Calendar } from "lucide-react";

export default function ReunioesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reunioes</h1>
          <p className="text-muted-foreground">
            Gerencie reunioes e atas automaticas
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nova Reuniao
        </button>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
        <Calendar className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhuma reuniao encontrada</h3>
        <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
          Registre suas reunioes para gerar atas automaticas e extrair entidades.
        </p>
        <button className="mt-4 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Registrar Reuniao
        </button>
      </div>
    </div>
  );
}
