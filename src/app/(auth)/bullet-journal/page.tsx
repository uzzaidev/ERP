import { ModulePlaceholder } from "@/components/layout";
import { NotebookPen } from "lucide-react";

const highlights = [
  {
    label: "Logs ativos",
    value: "24",
    detail: "Daily, Weekly e Monthly prontos",
  },
  {
    label: "Check-ins IA",
    value: "7",
    detail: "Insights gerados automaticamente",
  },
  {
    label: "Smart tags",
    value: "15",
    detail: "Contexto compartilhado com projetos",
  },
];

const roadmap = [
  {
    title: "Timeline retrofuturista",
    description: "Visual 3D inspirado no manual da marca para navegar pelos logs.",
    badge: "UI",
  },
  {
    title: "Templates inteligentes",
    description: "Salvar rituais como Daily Ops, OKR Review e Retro Sprint.",
    badge: "AI",
  },
  {
    title: "Checkpoint com Capacitor",
    description: "Modo offline no mobile para preencher notas rapidas no field.",
    badge: "Mobile",
  },
];

const insights = [
  "Sincronize decisoes e acoes diretamente das reunioes para manter o diario como fonte da verdade.",
  "Use tags por squad para alimentar o RAG e gerar briefings automaticos.",
];

export default function BulletJournalPage() {
  return (
    <ModulePlaceholder
      title="Bullet Journal"
      description="Centraliza rituais operacionais em um fluxo unico, pronto para IA e mobile."
      icon={NotebookPen}
      highlights={highlights}
      roadmap={roadmap}
      insights={insights}
    />
  );
}
