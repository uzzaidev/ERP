"use client";

import { useEffect, useState } from "react";
import { Plus, Search, ExternalLink, Calendar, DollarSign, Users } from "lucide-react";
import Link from "next/link";
import { CreateProjectModal } from "@/components/projects";

interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: number;
  spent_amount: number;
  project_members: Array<{ user_id: string; role: string }>;
  created_at: string;
}

export default function ProjetosPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      const data = await response.json();
      if (data.data) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(search.toLowerCase()) ||
    project.code.toLowerCase().includes(search.toLowerCase()) ||
    project.description?.toLowerCase().includes(search.toLowerCase())
  );

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Projetos</h1>
          <p className="mt-1 text-sm text-slate-400">
            Gerencie todos os projetos da empresa
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <Plus className="h-5 w-5" />
          Novo Projeto
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar projetos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      {/* Projects Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">Carregando projetos...</div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/30">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-700/50 bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Projeto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Orçamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Equipe
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredProjects.map((project) => {
                  const budgetUsed = project.budget > 0 
                    ? (project.spent_amount / project.budget) * 100 
                    : 0;

                  return (
                    <tr 
                      key={project.id} 
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {project.code}
                            </span>
                            <span className="text-slate-400">·</span>
                            <span className="text-white">{project.name}</span>
                          </div>
                          {project.description && (
                            <p className="mt-1 text-sm text-slate-400 line-clamp-1">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-300">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(project.start_date)}</span>
                          {project.end_date && (
                            <>
                              <span className="text-slate-500">→</span>
                              <span>{formatDate(project.end_date)}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-1.5 text-sm text-slate-300">
                            <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                            <span>{formatCurrency(project.spent_amount)}</span>
                            <span className="text-slate-500">/</span>
                            <span>{formatCurrency(project.budget)}</span>
                          </div>
                          {project.budget > 0 && (
                            <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-slate-700">
                              <div
                                className={`h-full transition-all ${
                                  budgetUsed > 90 ? 'bg-red-500' : budgetUsed > 70 ? 'bg-yellow-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-300">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span>{project.project_members?.length || 0} membros</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/projetos/${project.id}`}
                            className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProjects.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-slate-400">
                {search ? 'Nenhum projeto encontrado' : 'Nenhum projeto cadastrado'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={fetchProjects}
      />
    </div>
  );
}
