import { ModulePlaceholder } from "@/components/layout";
import { MonitorPlay } from "lucide-react";

const highlights = [
  { label: "Terminais mock", value: "05", detail: "PDVs simultaneos" },
  { label: "Vendas hoje", value: "R$ 7.950", detail: "Dados ficticios" },
  { label: "Itens medios", value: "3.4", detail: "Por ticket" },
];

const roadmap = [
  {
    title: "Interface neon",
    description: "Componentes amplos com alto contraste para telas touch.",
  },
  {
    title: "Fiscal assistido",
    description: "Assistente IA para orientar CFOP/NCM antes de emitir nota.",
  },
  {
    title: "Modo quiosque",
    description: "Deploy rapido usando WebView Capacitor.",
    badge: "Mobile",
  },
];

const insights = [
  "Integre estoque em tempo real para bloquear vendas de produtos com ruptura.",
];

export default function PDVPage() {
  return (
    <ModulePlaceholder
      title="Ponto de Venda"
      description="Experiencia fluida para frente de loja com look & feel retrofuturista."
      icon={MonitorPlay}
      highlights={highlights}
      roadmap={roadmap}
      insights={insights}
    />
  );
}
