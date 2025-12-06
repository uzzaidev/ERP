"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Lightbulb, Wrench, Settings, Target, Sparkles, CheckCircle, XCircle, RefreshCw, FileText } from "lucide-react";
import { CreateKaizenModal } from "@/components/kaizens/CreateKaizenModal";
import { EditKaizenModal } from "@/components/kaizens/EditKaizenModal";
import { KaizenImprovement as Kaizen } from "@/types/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function KaizensPage() {
  const [kaizens, setKaizens] = useState<Kaizen[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedKaizen, setSelectedKaizen] = useState<Kaizen | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const fetchKaizens = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== "all") params.append("category", filterCategory);
      
      const response = await fetch(`/api/kaizens?${params.toString()}`);
      const data = await response.json();
      if (data.success && data.data) {
        setKaizens(data.data);
      }
    } catch (error) {
      console.error('Error fetching kaizens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKaizens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory]);

  const handleCreateSuccess = () => {
    fetchKaizens();
  };

  const handleEditSuccess = () => {
    fetchKaizens();
  };

  const handleEditClick = (kaizen: Kaizen) => {
    setSelectedKaizen(kaizen);
    setEditModalOpen(true);
  };

  const filteredKaizens = kaizens.filter(kaizen =>
    kaizen.title.toLowerCase().includes(search.toLowerCase()) ||
    kaizen.code.toLowerCase().includes(search.toLowerCase()) ||
    kaizen.context?.toLowerCase().includes(search.toLowerCase()) ||
    kaizen.goldenRule?.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      technical: Wrench,
      process: Settings,
      strategic: Target,
      cultural: Sparkles,
    };
    return icons[category] || FileText;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      technical: "Técnico",
      process: "Processo",
      strategic: "Estratégico",
      cultural: "Cultural",
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technical: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      process: "bg-green-500/20 text-green-300 border-green-500/30",
      strategic: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      cultural: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    };
    return colors[category] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  const getCategoryStats = () => {
    const stats = {
      technical: 0,
      process: 0,
      strategic: 0,
      cultural: 0,
    };
    kaizens.forEach(k => {
      if (k.category in stats) {
        stats[k.category as keyof typeof stats]++;
      }
    });
    return stats;
  };

  const stats = getCategoryStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="h-8 w-8 text-yellow-400" />
            Kaizens
          </h1>
          <p className="text-gray-400 mt-1">
            Sistema de Melhoria Contínua - Capture e compartilhe aprendizados
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Kaizen
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-6 w-6 text-blue-400" />
            <span className="text-gray-400 text-sm">Técnico</span>
          </div>
          <div className="text-2xl font-bold text-blue-300">{stats.technical}</div>
        </div>
        
        <div className="bg-slate-800/50 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-6 w-6 text-green-400" />
            <span className="text-gray-400 text-sm">Processo</span>
          </div>
          <div className="text-2xl font-bold text-green-300">{stats.process}</div>
        </div>
        
        <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-6 w-6 text-purple-400" />
            <span className="text-gray-400 text-sm">Estratégico</span>
          </div>
          <div className="text-2xl font-bold text-purple-300">{stats.strategic}</div>
        </div>
        
        <div className="bg-slate-800/50 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-orange-400" />
            <span className="text-gray-400 text-sm">Cultural</span>
          </div>
          <div className="text-2xl font-bold text-orange-300">{stats.cultural}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar kaizens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="technical">
              <span className="flex items-center gap-2">
                <Wrench className="h-4 w-4" /> Técnico
              </span>
            </SelectItem>
            <SelectItem value="process">
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Processo
              </span>
            </SelectItem>
            <SelectItem value="strategic">
              <span className="flex items-center gap-2">
                <Target className="h-4 w-4" /> Estratégico
              </span>
            </SelectItem>
            <SelectItem value="cultural">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Cultural
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kaizens List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando kaizens...</div>
      ) : filteredKaizens.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Lightbulb className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Nenhum kaizen encontrado</p>
          <p className="text-sm mt-2">
            {search || filterCategory !== "all"
              ? "Tente ajustar os filtros"
              : "Crie seu primeiro kaizen para começar"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredKaizens.map((kaizen) => {
            const IconComponent = getCategoryIcon(kaizen.category);
            return (
              <div
                key={kaizen.id}
                onClick={() => handleEditClick(kaizen)}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 cursor-pointer hover:border-slate-600 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-6 w-6" />
                    <span className="text-sm text-gray-400 font-mono">{kaizen.code}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getCategoryColor(kaizen.category)}`}>
                    {getCategoryLabel(kaizen.category)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {kaizen.title}
                </h3>

                {/* Golden Rule */}
                {kaizen.goldenRule && (
                  <div className="mb-3">
                    <div className="flex items-start gap-2 text-sm text-yellow-400/80">
                      <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <p className="line-clamp-2">{kaizen.goldenRule}</p>
                    </div>
                  </div>
                )}

                {/* Learning Summary */}
                {kaizen.learning && (
                  <div className="space-y-1 text-xs text-gray-400">
                    {kaizen.learning.do && kaizen.learning.do.length > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-400" />
                        <span>{kaizen.learning.do.length} fazer</span>
                      </div>
                    )}
                    {kaizen.learning.avoid && kaizen.learning.avoid.length > 0 && (
                      <div className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-400" />
                        <span>{kaizen.learning.avoid.length} evitar</span>
                      </div>
                    )}
                    {kaizen.learning.adjust && kaizen.learning.adjust.length > 0 && (
                      <div className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3 text-blue-400" />
                        <span>{kaizen.learning.adjust.length} ajustar</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Related Project */}
                {kaizen.relatedProject && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-gray-400">
                    <span className="font-medium">Projeto:</span> {kaizen.relatedProject.code}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-gray-500">
                  {new Date(kaizen.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateKaizenModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      
      <EditKaizenModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedKaizen(null);
        }}
        onSuccess={handleEditSuccess}
        kaizen={selectedKaizen}
      />
    </div>
  );
}
