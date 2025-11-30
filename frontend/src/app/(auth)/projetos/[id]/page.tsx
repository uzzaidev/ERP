import { ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";

export default function ProjetoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/projetos"
            className="rounded-md p-2 hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Projeto {params.id}
            </h1>
            <p className="text-muted-foreground">
              Detalhes e dashboard do projeto
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
          <Settings className="h-4 w-4" />
          Configuracoes
        </button>
      </div>

      {/* Content placeholder */}
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          Conteudo do projeto sera exibido aqui.
        </p>
      </div>
    </div>
  );
}
