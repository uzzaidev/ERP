import { ModulePlaceholder } from "@/components/layout";
import { Users } from "lucide-react";

const highlights = [
  {
    label: "Pessoas",
    value: "32",
    detail: "Perfis unificados com skills + disponibilidade",
  },
  {
    label: "Carga",
    value: "68%",
    detail: "Media de alocacao semanal",
  },
  {
    label: "Feedbacks",
    value: "12",
    detail: "Rodadas 360 graus planejadas",
  },
];

const roadmap = [
  {
    title: "Mapa de calor",
    description: "Visualizar alocacao por squad utilizando gradientes UZZ.AI.",
  },
  {
    title: "People Analytics",
    description: "Score dinamico baseado em entregas, reunioes e diario.",
    badge: "AI",
  },
  {
    title: "Perfil mobile",
    description: "Equipe consegue aprovar horas e acoes direto do Capacitor app.",
    badge: "Mobile",
  },
];

const insights = [
  "Conecte as acoes do Kanban e bullet journal para alimentar o desempenho individual.",
  "Permita filtros por stack para acelerar a alocacao em projetos MeguisPet.",
];

export default function EquipePage() {
  return (
    <ModulePlaceholder
      title="Equipe"
      description="Gestao de people com contexto 360 graus entre projetos, financeiro e IA."
      icon={Users}
      highlights={highlights}
      roadmap={roadmap}
      insights={insights}
    />
  );
}
