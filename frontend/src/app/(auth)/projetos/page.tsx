import { Plus, FolderKanban } from "lucide-react";

export default function ProjetosPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground">
            Gerencie seus projetos e sprints
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Novo Projeto
        </button>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
        <FolderKanban className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum projeto encontrado</h3>
        <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
          Crie seu primeiro projeto para comecar a gerenciar suas atividades e sprints.
        </p>
        <button className="mt-4 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Criar Projeto
        </button>
      </div>
    </div>
  );
}
