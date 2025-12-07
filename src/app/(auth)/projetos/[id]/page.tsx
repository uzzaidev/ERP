"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  Settings,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  UserPlus,
  X,
  LayoutList,
  GanttChartIcon
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AddProjectMemberModal } from "@/components/projects/AddProjectMemberModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GanttChart } from "@/components/charts/GanttChart";

interface ProjectMember {
  id: string;
  role: string;
  user_id: string;
  users: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  start_date: string;
  end_date: string;
  budget: number;
  spent: number;
  estimated_hours: number;
  completed_hours: number;
  client_name: string;
  client_contact: string;
  client_email: string;
  owner: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  } | null;
  project_members: ProjectMember[];
  created_at: string;
}

interface Task {
  id: string;
  code: string;
  title: string;
  status: string;
  priority: string;
  assignee: {
    id: string;
    full_name: string;
  } | null;
  estimated_hours: number;
  completed_hours: number;
  started_at: string | null;
  due_date: string | null;
}

export default function ProjetoDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const fetchProjectData = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${id}`);
      const data = await response.json();
      if (data.success && data.data) {
        setProject(data.data);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchProjectTasks = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks?project_id=${id}`);
      const data = await response.json();
      if (data.success && data.data) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProjectData();
      fetchProjectTasks();
    }
  }, [id, fetchProjectData, fetchProjectTasks]);

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Tem certeza que deseja remover este membro do projeto?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/projects/${id}/members?member_id=${memberId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Erro ao remover membro");
      }

      // Refresh project data
      fetchProjectData();
    } catch (error) {
      console.error("Error removing member:", error);
      alert(error instanceof Error ? error.message : "Erro ao remover membro");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-400">Carregando projeto...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-slate-400 mb-4" />
        <div className="text-slate-400">Projeto não encontrado</div>
        <Link
          href="/projetos"
          className="mt-4 text-emerald-500 hover:text-emerald-400"
        >
          Voltar para projetos
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      on_hold: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      completed: "bg-slate-500/20 text-slate-300 border-slate-500/30",
      cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
    };
    return colors[status] || colors.active;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      planning: "Planejamento",
      active: "Ativo",
      on_hold: "Em espera",
      completed: "Concluído",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "text-slate-400",
      medium: "text-blue-400",
      high: "text-yellow-400",
      critical: "text-red-400",
    };
    return colors[priority] || colors.medium;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (date: string) => {
    if (!date) return "Não definido";
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const budgetUsed = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/projetos"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-white">
                {project.code} - {project.name}
              </h1>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(project.status)}`}>
                {getStatusLabel(project.status)}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {project.description || "Sem descrição"}
            </p>
          </div>
        </div>
        <Link
          href={`/projetos`}
          className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <Settings className="h-4 w-4" />
          Configurações
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasks Stats */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Tarefas</p>
              <p className="text-2xl font-semibold text-white mt-1">
                {completedTasks}/{totalTasks}
              </p>
            </div>
            <div className="rounded-full bg-emerald-500/20 p-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{inProgressTasks} em progresso</span>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Orçamento</p>
              <p className="text-2xl font-semibold text-white mt-1">
                {budgetUsed.toFixed(0)}%
              </p>
            </div>
            <div className="rounded-full bg-blue-500/20 p-3">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-slate-400">
              {formatCurrency(project.spent)} de {formatCurrency(project.budget)}
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Horas</p>
              <p className="text-2xl font-semibold text-white mt-1">
                {project.completed_hours.toFixed(0)}h
              </p>
            </div>
            <div className="rounded-full bg-yellow-500/20 p-3">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-slate-400">
              de {project.estimated_hours}h estimadas
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Equipe</p>
              <p className="text-2xl font-semibold text-white mt-1">
                {project.project_members.length}
              </p>
            </div>
            <div className="rounded-full bg-purple-500/20 p-3">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-slate-400">
              membros ativos
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs for different views */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutList className="h-4 w-4" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <GanttChartIcon className="h-4 w-4" />
                Timeline
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Project Details */}
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Detalhes do Projeto</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Data de Início</p>
                      <div className="flex items-center gap-2 text-sm text-slate-200">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {formatDate(project.start_date)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Data de Término</p>
                      <div className="flex items-center gap-2 text-sm text-slate-200">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {formatDate(project.end_date)}
                      </div>
                    </div>
                  </div>

                  {project.client_name && (
                    <div className="border-t border-slate-700/50 pt-4">
                      <p className="text-xs text-slate-400 mb-2">Cliente</p>
                      <div className="space-y-1">
                        <p className="text-sm text-slate-200 font-medium">{project.client_name}</p>
                        {project.client_contact && (
                          <p className="text-xs text-slate-400">{project.client_contact}</p>
                        )}
                        {project.client_email && (
                          <p className="text-xs text-slate-400">{project.client_email}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Budget Progress */}
                  <div className="border-t border-slate-700/50 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-400">Progresso do Orçamento</p>
                      <span className="text-xs text-slate-300">{budgetUsed.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                      <div
                        className={`h-full transition-all ${
                          budgetUsed > 90 ? 'bg-red-500' : budgetUsed > 70 ? 'bg-yellow-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Tarefas do Projeto</h2>
                  <Link
                    href={`/kanban?project=${id}`}
                    className="text-sm text-emerald-500 hover:text-emerald-400"
                  >
                    Ver todas →
                  </Link>
                </div>
                <div className="space-y-2">
                  {tasks.slice(0, 10).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-700/30 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-mono">{task.code}</span>
                        <span className="text-sm text-slate-200">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.assignee && (
                          <span className="text-xs text-slate-400">{task.assignee.full_name}</span>
                        )}
                        <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      Nenhuma tarefa neste projeto ainda
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="mt-6">
              <GanttChart
                tasks={tasks}
                projectStartDate={project.start_date}
                projectEndDate={project.end_date}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Right Side */}
        <div className="space-y-6">
          {/* Project Owner */}
          {project.owner && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-6">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Responsável</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{project.owner.full_name}</p>
                  <p className="text-xs text-slate-400">{project.owner.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Team Members */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-400">
                Equipe ({project.project_members.length})
              </h3>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/30 transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {project.project_members.map((member) => (
                <div key={member.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-200">{member.users.full_name}</p>
                      <p className="text-xs text-slate-500">{member.role || "Sem função"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-red-400 hover:bg-red-500/20 transition-all"
                    title="Remover membro"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {project.project_members.length === 0 && (
                <div className="text-center py-4 text-slate-400 text-xs">
                  Nenhum membro adicionado
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-6">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Estatísticas Rápidas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Taxa de Conclusão</span>
                <span className="text-sm font-medium text-slate-200">
                  {totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Horas/Tarefa</span>
                <span className="text-sm font-medium text-slate-200">
                  {totalTasks > 0 ? (project.estimated_hours / totalTasks).toFixed(1) : 0}h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Progresso Geral</span>
                <span className="text-sm font-medium text-emerald-400">
                  {totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      <AddProjectMemberModal
        open={showAddMemberModal}
        onOpenChange={setShowAddMemberModal}
        projectId={id}
        onSuccess={() => {
          fetchProjectData();
        }}
      />
    </div>
  );
}
