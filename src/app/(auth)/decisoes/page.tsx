"use client";

import { useEffect, useState } from "react";
import { Plus, Search, FileText, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { CreateDecisionModal } from "@/components/decisions/CreateDecisionModal";
import { EditDecisionModal } from "@/components/decisions/EditDecisionModal";
import { Decision } from "@/types/entities";

export default function DecisoesPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterPriority !== "all") params.append("priority", filterPriority);
      
      const response = await fetch(`/api/decisions?${params.toString()}`);
      const data = await response.json();
      if (data.success && data.data) {
        setDecisions(data.data);
      }
    } catch (error) {
      console.error('Error fetching decisions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterPriority]);

  const handleCreateSuccess = () => {
    fetchDecisions();
  };

  const handleEditSuccess = () => {
    fetchDecisions();
  };

  const handleEditClick = (decision: Decision) => {
    setSelectedDecision(decision);
    setEditModalOpen(true);
  };

  const filteredDecisions = decisions.filter(decision =>
    decision.title.toLowerCase().includes(search.toLowerCase()) ||
    decision.code.toLowerCase().includes(search.toLowerCase()) ||
    decision.context?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      draft: <Clock className="h-4 w-4" />,
      approved: <CheckCircle2 className="h-4 w-4" />,
      implemented: <CheckCircle2 className="h-4 w-4" />,
      deprecated: <XCircle className="h-4 w-4" />,
      superseded: <AlertCircle className="h-4 w-4" />,
    };
    return icons[status] || icons.draft;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
      approved: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      implemented: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      deprecated: "bg-red-500/20 text-red-300 border-red-500/30",
      superseded: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    };
    return colors[status] || colors.draft;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Rascunho",
      approved: "Aprovada",
      implemented: "Implementada",
      deprecated: "Depreciada",
      superseded: "Substituída",
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      critical: "bg-red-500/20 text-red-300 border-red-500/30",
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      low: "Baixa",
      medium: "Média",
      high: "Alta",
      critical: "Crítica",
    };
    return labels[priority] || priority;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Decisões (ADRs)
          </h1>
          <p className="text-slate-400 mt-2">
            Architecture Decision Records - Registre decisões importantes com contexto completo
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nova Decisão
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar decisões..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos os Status</option>
            <option value="draft">Rascunho</option>
            <option value="approved">Aprovada</option>
            <option value="implemented">Implementada</option>
            <option value="deprecated">Depreciada</option>
            <option value="superseded">Substituída</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
          <div className="text-slate-400 text-sm mb-1">Total</div>
          <div className="text-2xl font-bold text-white">{decisions.length}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
          <div className="text-slate-400 text-sm mb-1">Rascunho</div>
          <div className="text-2xl font-bold text-slate-300">
            {decisions.filter(d => d.status === 'draft').length}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
          <div className="text-slate-400 text-sm mb-1">Aprovadas</div>
          <div className="text-2xl font-bold text-blue-300">
            {decisions.filter(d => d.status === 'approved').length}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
          <div className="text-slate-400 text-sm mb-1">Implementadas</div>
          <div className="text-2xl font-bold text-emerald-300">
            {decisions.filter(d => d.status === 'implemented').length}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
          <div className="text-slate-400 text-sm mb-1">Críticas</div>
          <div className="text-2xl font-bold text-red-300">
            {decisions.filter(d => d.priority === 'critical').length}
          </div>
        </div>
      </div>

      {/* Decisions List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
          <p className="text-slate-400 mt-4">Carregando decisões...</p>
        </div>
      ) : filteredDecisions.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">
            {search ? "Nenhuma decisão encontrada" : "Nenhuma decisão registrada ainda"}
          </p>
          <p className="text-slate-500 mt-2">
            {search ? "Tente ajustar os filtros de busca" : "Clique em 'Nova Decisão' para começar"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDecisions.map((decision) => (
            <div
              key={decision.id}
              onClick={() => handleEditClick(decision)}
              className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-6 hover:bg-slate-800/70 hover:border-purple-500/50 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-slate-400 text-sm font-mono">{decision.code}</span>
                      <span className={`px-2 py-1 rounded-md border text-xs font-medium flex items-center gap-1 ${getStatusColor(decision.status)}`}>
                        {getStatusIcon(decision.status)}
                        {getStatusLabel(decision.status)}
                      </span>
                      <span className={`px-2 py-1 rounded-md border text-xs font-medium ${getPriorityColor(decision.priority)}`}>
                        {getPriorityLabel(decision.priority)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{decision.title}</h3>
                    {decision.context && (
                      <p className="text-slate-400 text-sm line-clamp-2">{decision.context}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-4 border-t border-slate-700/50">
                <span>
                  Criada em {new Date(decision.createdAt).toLocaleDateString('pt-BR')}
                </span>
                {decision.relatedProject && (
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {decision.relatedProject.name}
                  </span>
                )}
                {decision.relatedTaskIds && decision.relatedTaskIds.length > 0 && (
                  <span>{decision.relatedTaskIds.length} tarefas relacionadas</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateDecisionModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      {selectedDecision && (
        <EditDecisionModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedDecision(null);
          }}
          decision={selectedDecision}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
