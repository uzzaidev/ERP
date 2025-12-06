"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { navigation } from "@/config/navigation";
import {
  Activity,
  AlertTriangle,
  FolderKanban,
  CheckSquare,
  Zap,
  TrendingUp,
  Calendar,
  Clock,
} from "lucide-react";
import { VelocityChart, BurndownChart } from "@/components/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardStats {
  projectsActive: number;
  tasksPending: number;
  tasksCompleted: number;
  teamOnline: number;
  velocity: number;
  avgVelocity: number;
  sprintProgress: number;
  activeSprint: {
    id: string;
    name: string;
    endDate: string;
    daysRemaining: number;
  } | null;
}

interface RecentActivity {
  id: string;
  title: string;
  detail: string;
  time: string;
  type: 'task' | 'project' | 'sprint';
}

interface Alert {
  id: string;
  title: string;
  tone: 'warning' | 'critical';
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    projectsActive: 0,
    tasksPending: 0,
    tasksCompleted: 0,
    teamOnline: 0,
    velocity: 0,
    avgVelocity: 0,
    sprintProgress: 0,
    activeSprint: null,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Buscar projetos ativos
        const projectsRes = await fetch('/api/projects');
        const projectsData = await projectsRes.json();
        const projects = projectsData.data || [];
        const projectsActive = projects.filter((p: { status: string }) => p.status === 'active').length;

        // Buscar todas as tarefas
        const tasksRes = await fetch('/api/tasks');
        const tasksData = await tasksRes.json();
        const allTasks = tasksData.data || [];
        
        const tasksPending = allTasks.filter((t: { status: string }) => 
          t.status === 'todo' || t.status === 'in-progress'
        ).length;
        
        const tasksCompleted = allTasks.filter((t: { status: string }) => 
          t.status === 'done'
        ).length;

        // Buscar usuários ativos
        const usersRes = await fetch('/api/users');
        const usersData = await usersRes.json();
        const teamOnline = usersData.data?.filter((u: { is_active: boolean }) => u.is_active).length || 0;

        // Calcular velocidade atual (% de tasks concluídas)
        const total = tasksPending + tasksCompleted;
        const velocity = total > 0 ? Math.round((tasksCompleted / total) * 100) : 0;

        // Buscar velocity média
        const velocityRes = await fetch('/api/analytics/velocity?limit=6');
        const velocityData = await velocityRes.json();
        const avgVelocity = velocityData.success ? velocityData.data.metrics.avgVelocity : 0;

        // Buscar sprint ativa
        const sprintsRes = await fetch('/api/sprints');
        const sprintsData = await sprintsRes.json();
        const sprints = sprintsData.data || [];
        const activeSprint = sprints.find((s: { status: string }) => s.status === 'active');

        let sprintStats = null;
        let sprintProgress = 0;

        if (activeSprint) {
          // Buscar tasks da sprint ativa
          const sprintTasks = allTasks.filter((t: { sprint_id: string }) => 
            t.sprint_id === activeSprint.id
          );
          const sprintCompleted = sprintTasks.filter((t: { status: string }) => 
            t.status === 'done'
          ).length;
          sprintProgress = sprintTasks.length > 0 
            ? Math.round((sprintCompleted / sprintTasks.length) * 100) 
            : 0;

          const endDate = new Date(activeSprint.end_date);
          const now = new Date();
          const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          sprintStats = {
            id: activeSprint.id,
            name: activeSprint.name,
            endDate: activeSprint.end_date,
            daysRemaining,
          };

          // Criar alertas baseados na sprint
          const newAlerts: Alert[] = [];
          if (daysRemaining <= 2 && daysRemaining >= 0) {
            newAlerts.push({
              id: 'sprint-ending',
              title: `Sprint "${activeSprint.name}" termina em ${daysRemaining} dia${daysRemaining !== 1 ? 's' : ''}`,
              tone: 'warning',
            });
          }
          if (sprintProgress < 50 && daysRemaining <= 3) {
            newAlerts.push({
              id: 'sprint-behind',
              title: `Sprint com ${sprintProgress}% de progresso e ${daysRemaining} dias restantes`,
              tone: 'critical',
            });
          }
          setAlerts(newAlerts);
        }

        // Buscar atividades recentes (últimas tasks modificadas)
        const recentTasks = allTasks
          .sort((a: { updated_at: string }, b: { updated_at: string }) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )
          .slice(0, 5);

        const recentActivities: RecentActivity[] = recentTasks.map((task: {
          id: string;
          title: string;
          status: string;
          updated_at: string;
        }) => {
          const updatedAt = new Date(task.updated_at);
          const now = new Date();
          const hoursAgo = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60));
          
          let timeStr = '';
          if (hoursAgo < 1) timeStr = 'agora';
          else if (hoursAgo === 1) timeStr = '1h atrás';
          else if (hoursAgo < 24) timeStr = `${hoursAgo}h atrás`;
          else timeStr = `${Math.floor(hoursAgo / 24)}d atrás`;

          return {
            id: task.id,
            title: task.status === 'done' ? 'Tarefa concluída' : 'Tarefa atualizada',
            detail: task.title,
            time: timeStr,
            type: 'task',
          };
        });

        setActivities(recentActivities);

        setStats({
          projectsActive,
          tasksPending,
          tasksCompleted,
          teamOnline,
          velocity,
          avgVelocity,
          sprintProgress,
          activeSprint: sprintStats,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const kpis = [
    { 
      title: "Projetos ativos", 
      value: loading ? "..." : String(stats.projectsActive), 
      icon: FolderKanban,
      color: "text-blue-400"
    },
    { 
      title: "Tarefas pendentes", 
      value: loading ? "..." : String(stats.tasksPending), 
      icon: CheckSquare,
      color: "text-amber-400"
    },
    { 
      title: "Tarefas concluídas", 
      value: loading ? "..." : String(stats.tasksCompleted), 
      icon: TrendingUp,
      color: "text-emerald-400"
    },
    { 
      title: "Velocidade média", 
      value: loading ? "..." : `${stats.avgVelocity}%`, 
      icon: Zap,
      color: "text-purple-400"
    },
  ];
  const quickModules = navigation.flatMap((group) =>
    group.items.slice(0, 2).map((item) => ({
      title: item.title,
      href: item.href,
      icon: item.icon,
    }))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/50 to-slate-950/50 p-6 backdrop-blur-sm">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Visão geral do sistema</p>
      </section>

      {/* Quick Access Modules */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.href}
              href={module.href}
              className="flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-900/40 p-4 backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:bg-slate-900/60"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950/50 text-emerald-400">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-white">{module.title}</span>
            </Link>
          );
        })}
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-5 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">{kpi.title}</p>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">{kpi.value}</p>
            </div>
          );
        })}
      </section>

      {/* Sprint Progress Card */}
      {stats.activeSprint && (
        <Card className="border-slate-700/50 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5 text-purple-400" />
              Sprint Ativa: {stats.activeSprint.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-400">
                    {stats.activeSprint.daysRemaining > 0 
                      ? `${stats.activeSprint.daysRemaining} dia${stats.activeSprint.daysRemaining !== 1 ? 's' : ''} restante${stats.activeSprint.daysRemaining !== 1 ? 's' : ''}`
                      : 'Encerrada'}
                  </span>
                </div>
                <span className="text-sm font-medium text-white">
                  {stats.sprintProgress}% completo
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-700/50">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all"
                  style={{ width: `${stats.sprintProgress}%` }}
                />
              </div>
              <Link 
                href="/performance"
                className="inline-flex text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Ver detalhes →
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Analytics</h2>
        <Tabs defaultValue="velocity" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="velocity">Velocidade</TabsTrigger>
            <TabsTrigger value="burndown">Burndown</TabsTrigger>
          </TabsList>

          <TabsContent value="velocity">
            <VelocityChart limit={6} />
          </TabsContent>

          <TabsContent value="burndown">
            {stats.activeSprint ? (
              <BurndownChart sprintId={stats.activeSprint.id} />
            ) : (
              <Card className="border-slate-700/50 bg-slate-900/40">
                <CardContent className="flex items-center justify-center h-[300px]">
                  <p className="text-muted-foreground">
                    Nenhuma sprint ativa. Crie uma sprint para ver o burndown chart.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Activity & Alerts Grid */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-medium text-white">Atividade recente</h2>
          </div>
          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.map((item) => (
                <div key={item.id} className="flex items-start justify-between border-b border-slate-700/30 pb-3 last:border-0">
                  <div>
                    <p className="text-sm text-white">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.detail}</p>
                  </div>
                  <span className="text-xs text-slate-500">{item.time}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Nenhuma atividade recente</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h2 className="text-sm font-medium text-white">Alertas</h2>
          </div>
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3"
                >
                  <p className="text-sm text-white">{alert.title}</p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      alert.tone === "critical" 
                        ? "bg-red-500/20 text-red-300" 
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {alert.tone}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Nenhum alerta no momento</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
