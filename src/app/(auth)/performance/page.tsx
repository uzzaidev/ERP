import { ModulePlaceholder } from "@/components/layout";
import { Gauge } from "lucide-react";

const highlights = [
  { label: "OKRs", value: "6", detail: "Ciclos trimestrais em acompanhamento" },
  { label: "KPIs", value: "18", detail: "Painel consolidado" },
  { label: "Alertas", value: "3", detail: "Metas com risco" },
];

const roadmap = [
  {
    title: "Scorecards tematicos",
    description: "Templates para Growth, Operacoes e Customer Success.",
  },
  {
    title: "Insights com RAG",
    description: "Cruzar decisoes, financas e tarefas para explicar desvios.",
    badge: "AI",
  },
  {
    title: "Modo apresentacao",
    description: "Compartilhar resultados em reunioes diretamente do dashboard.",
  },
];

const insights = [
  "Utilize as metricas mock para validar o layout com stakeholders antes dos dados reais.",
];

export default function PerformancePage() {
  return (
    <ModulePlaceholder
      title="Performance & OKRs"
      description="Medicao consistente da estrategia, conectada aos fluxos operacionais."
      icon={Gauge}
      highlights={highlights}
      roadmap={roadmap}
      insights={insights}
    />
  );
}
