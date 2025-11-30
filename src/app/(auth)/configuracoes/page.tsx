import { ModulePlaceholder } from "@/components/layout";
import { Settings } from "lucide-react";

const highlights = [
  { label: "Workspaces", value: "02", detail: "UzzAI + MeguisPet" },
  { label: "Integracoes", value: "08", detail: "Supabase, Doppler, Capacitor, etc." },
  { label: "Auditorias", value: "100%", detail: "Logs mock atualizados" },
];

const roadmap = [
  {
    title: "Centro de controle",
    description: "Config gerais com cards tematicos (branding, IA, notificacoes).",
  },
  {
    title: "Env manager",
    description: "Sync com Doppler + variaveis do Capacitor.",
  },
  {
    title: "Feature Flags",
    description: "Ativar modulos por workspace, com rollout gradual.",
  },
];

const insights = [
  "Prepare presets para clientes MeguisPet, acelerando on-boarding.",
];

export default function ConfiguracoesPage() {
  return (
    <ModulePlaceholder
      title="Configuracoes"
      description="Painel unico para branding, integracoes e governanca."
      icon={Settings}
      highlights={highlights}
      roadmap={roadmap}
      insights={insights}
    />
  );
}
