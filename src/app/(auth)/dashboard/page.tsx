"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { navigation } from "@/config/navigation";
import {
  Activity,
  AlertTriangle,
  FolderKanban,
  CheckSquare,
  Users,
  Zap,
} from "lucide-react";

interface DashboardStats {
  projectsActive: number;
  tasksPending: number;
  teamOnline: number;
  velocity: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    projectsActive: 0,
    tasksPending: 0,
    teamOnline: 0,
    velocity: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Buscar projetos ativos
        const projectsRes = await fetch('/api/projects?status=active');
        const projectsData = await projectsRes.json();
        const projectsActive = projectsData.data?.length || 0;

        // Buscar tarefas pendentes
        const tasksRes = await fetch('/api/tasks?status=todo,in-progress');
        const tasksData = await tasksRes.json();
        const tasksPending = tasksData.data?.length || 0;

        // Buscar usuários ativos
        const usersRes = await fetch('/api/users?is_active=true');
        const usersData = await usersRes.json();
        const teamOnline = usersData.data?.length || 0;

        // Calcular velocidade (exemplo: % de tasks concluídas)
        const completedRes = await fetch('/api/tasks?status=done');
        const completedData = await completedRes.json();
        const completed = completedData.data?.length || 0;
        const total = tasksPending + completed;
        const velocity = total > 0 ? Math.round((completed / total) * 100) : 0;

        setStats({
          projectsActive,
          tasksPending,
          teamOnline,
          velocity,
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
    { title: "Projetos ativos", value: loading ? "..." : String(stats.projectsActive), icon: FolderKanban },
    { title: "Acoes pendentes", value: loading ? "..." : String(stats.tasksPending), icon: CheckSquare },
    { title: "Equipe online", value: loading ? "..." : String(stats.teamOnline), icon: Users },
    { title: "Velocidade", value: loading ? "..." : `${stats.velocity}%`, icon: Zap },
  ];

  const activity = [
    { title: "Reuniao finalizada", detail: "Sprint Planning", time: "2h" },
    { title: "Acao concluida", detail: "Login Capacitor", time: "4h" },
  ];

  const alerts = [
    { title: "Sprint termina em 2 dias", tone: "warning" },
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
      <section className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/50 to-slate-950/50 p-6 backdrop-blur-sm">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Visao geral do sistema</p>
      </section>

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
                <Icon className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">{kpi.value}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-medium text-white">Atividade recente</h2>
          </div>
          <div className="space-y-3">
            {activity.map((item) => (
              <div key={item.title} className="flex items-start justify-between border-b border-slate-700/30 pb-3 last:border-0">
                <div>
                  <p className="text-sm text-white">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.detail}</p>
                </div>
                <span className="text-xs text-slate-500">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h2 className="text-sm font-medium text-white">Alertas</h2>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.title}
                className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3"
              >
                <p className="text-sm text-white">{alert.title}</p>
                <span
                  className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${alert.tone === "critical" ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"}`}
                >
                  {alert.tone}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
