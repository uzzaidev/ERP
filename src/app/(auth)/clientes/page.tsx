import { ModulePlaceholder } from "@/components/layout";
import { UserCircle } from "lucide-react";

const highlights = [
  { label: "Clientes ativos", value: "210", detail: "Dados mock" },
  { label: "NPS", value: "+62", detail: "Ultimo ciclo" },
  { label: "Segmentos", value: "4", detail: "Petshop, Vet, Distribuidor, SaaS" },
];

const roadmap = [
  {
    title: "Linha do tempo 360 graus",
    description: "Historico de vendas, acoes e notas fiscais em um unico card.",
  },
  {
    title: "Enriquecimento automatico",
    description: "Buscar dados externos e alimentar ICP via IA.",
    badge: "AI",
  },
  {
    title: "Portal cliente",
    description: "Area autenticada para acompanhar pedidos e financas.",
  },
];

const insights = [
  "As fichas de cliente alimentarao o RAG para sugerir upsell dentro de reunioes.",
];

export default function ClientesPage() {
  return (
    <ModulePlaceholder
      title="Clientes"
      description="Cadastros unificados para relacionar vendas, financeiro e suporte."
      icon={UserCircle}
      highlights={highlights}
      roadmap={roadmap}
      insights={insights}
    />
  );
}
