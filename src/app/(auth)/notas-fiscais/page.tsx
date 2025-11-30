import { ModulePlaceholder } from "@/components/layout";
import { FileText } from "lucide-react";

const highlights = [
  { label: "NFe mock", value: "12", detail: "Ultimos 7 dias" },
  { label: "NFSe", value: "6", detail: "Servicos aprovados" },
  { label: "Erros", value: "0", detail: "Fila limpa" },
];

const roadmap = [
  {
    title: "Wizard orientado",
    description: "Assistente passo-a-passo para CFOP, impostos e envio."
  },
  {
    title: "Validador Realtime",
    description: "Monitor em tempo real com alertas de rejeicao para squads."
  },
  {
    title: "Integracao Supabase",
    description: "Salvar XML + PDF e sincronizar com mobile para consulta offline.",
    badge: "Infra",
  },
];

const insights = [
  "Defina presets por tipo de operacao MeguisPet (produto, servico, assinatura).",
];

export default function NotasFiscaisPage() {
  return (
    <ModulePlaceholder
      title="Notas Fiscais"
      description="Emissao NFe/NFSe integrada ao ERP comercial e financeiro."
      icon={FileText}
      highlights={highlights}
      roadmap={roadmap}
      insights={insights}
    />
  );
}
