import { ModulePlaceholder } from "@/components/layout";
import { ShoppingCart } from "lucide-react";

const highlights = [
  { label: "Pedidos ativos", value: "34", detail: "Somando PDV + e-commerce" },
  { label: "Ticket medio", value: "R$ 487", detail: "Mock atualizado" },
  { label: "Conversao", value: "12%", detail: "Comparado a ultima sprint" },
];

const roadmap = [
  {
    title: "Pipeline 3D",
    description: "Etapas com cards retrofuturistas, inspirados no site poker.luisfboff.com.",
  },
  {
    title: "Cross-sell inteligente",
    description: "Sugerir combos com base no estoque e historico do cliente.",
    badge: "AI",
  },
  {
    title: "Modo mobile",
    description: "Garantir operacao do time comercial via Capacitor offline.",
    badge: "Mobile",
  },
];

const insights = [
  "Conecte automaticamente com Contas a Receber para prever fluxo de caixa.",
  "Classifique oportunidades por ICP e intensidade de relacionamento.",
];

export default function VendasPage() {
  return (
    <ModulePlaceholder
      title="Vendas"
      description="PDV, orcamentos e pedidos com pipeline unificado do MeguisPet."
      icon={ShoppingCart}
      highlights={highlights}
      roadmap={roadmap}
      insights={insights}
    />
  );
}
