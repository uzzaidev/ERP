import { ModulePlaceholder } from "@/components/layout";
import { Brain } from "lucide-react";

const highlights = [
  { label: "Bases indexadas", value: "04", detail: "Decisions, Actions, Kaizens, Clientes" },
  { label: "Agents", value: "12", detail: "Extraction + Enrichment" },
  { label: "Respostas", value: "1.2s", detail: "Tempo medio mock" },
];

const roadmap = [
  {
    title: "Console retro",
    description: "UI inspirada em terminais neon para explorar o grafo de conhecimento.",
  },
  {
    title: "Playbooks",
    description: "Salvar prompts assistidos para squads (financeiro, produtos, vendas).",
    badge: "AI",
  },
  {
    title: "Observability",
    description: "Telemetria de tokens + custo, conectada ao Supabase."
  },
];

const insights = [
  "Rastreie decisoes MeguisPet e reutilize no ERP UzzAI como base de treino.",
];

export default function RagInsightsPage() {
  return (
    <ModulePlaceholder
      title="RAG Insights"
      description="Motor cognitivo que conecta diario, reunioes e ERP comercial."
      icon={Brain}
      highlights={highlights}
      roadmap={roadmap}
      insights={insights}
    />
  );
}
