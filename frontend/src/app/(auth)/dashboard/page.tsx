import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visao geral do sistema ERP-UzzAI
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Projetos Ativos"
          value="12"
          description="+2 este mes"
          icon={FolderKanban}
        />
        <KPICard
          title="Acoes Pendentes"
          value="48"
          description="7 vencem hoje"
          icon={CheckSquare}
        />
        <KPICard
          title="Membros da Equipe"
          value="8"
          description="3 em reuniao"
          icon={Users}
        />
        <KPICard
          title="Progresso Geral"
          value="68%"
          description="+5% desde ontem"
          icon={TrendingUp}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Atividade Recente</h2>
          </div>
          <div className="space-y-4">
            <ActivityItem
              title="Reuniao finalizada"
              description="Sprint Planning - CHATBOT"
              time="Ha 2 horas"
            />
            <ActivityItem
              title="Acao concluida"
              description="A-2025-123: Implementar login OAuth"
              time="Ha 4 horas"
            />
            <ActivityItem
              title="Decisao registrada"
              description="D-2025-042: Migrar para Capacitor"
              time="Ha 1 dia"
            />
          </div>
        </div>

        {/* Alerts */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h2 className="font-semibold">Alertas</h2>
          </div>
          <div className="space-y-4">
            <AlertItem
              title="Sprint vence em 2 dias"
              description="Sprint-2025-W48 tem 5 acoes pendentes"
              severity="warning"
            />
            <AlertItem
              title="Risco alto identificado"
              description="R-CHATBOT-003: LOI SEDETEC atrasada"
              severity="error"
            />
            <AlertItem
              title="Estoque baixo"
              description="3 produtos abaixo do minimo"
              severity="warning"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold">{value}</span>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

function ActivityItem({
  title,
  description,
  time,
}: {
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
    </div>
  );
}

function AlertItem({
  title,
  description,
  severity,
}: {
  title: string;
  description: string;
  severity: "warning" | "error";
}) {
  const colors = {
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    error: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className={`rounded-md border p-3 ${colors[severity]}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs mt-1 opacity-80">{description}</p>
    </div>
  );
}
