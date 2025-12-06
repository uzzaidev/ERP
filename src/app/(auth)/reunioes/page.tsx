"use client";

import { useEffect, useState } from "react";
import { Plus, Calendar, Search, TrendingUp, Users } from "lucide-react";
import { CreateMeetingModal } from "@/components/meetings/CreateMeetingModal";
import { EditMeetingModal } from "@/components/meetings/EditMeetingModal";
import { EffectivenessScore } from "@/components/meetings/EffectivenessScore";
import { Meeting } from "@/types/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ReunioesPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/meetings");
      const data = await response.json();
      if (data.success && data.data) {
        setMeetings(data.data);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleCreateSuccess = () => {
    fetchMeetings();
  };

  const handleEditSuccess = () => {
    fetchMeetings();
  };

  const handleEditClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setEditModalOpen(true);
  };

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(search.toLowerCase()) ||
    meeting.code.toLowerCase().includes(search.toLowerCase()) ||
    meeting.notes?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate statistics
  const avgScore = meetings.length > 0
    ? Math.round(meetings.reduce((sum, m) => sum + (m.effectivenessScore || 0), 0) / meetings.length)
    : 0;
  
  const totalOutputs = meetings.reduce((sum, m) => 
    sum + m.decisionsCount + m.actionsCount + m.kaizensCount + m.blockersCount, 0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-blue-400" />
            Reuniões
          </h1>
          <p className="text-gray-400 mt-1">
            Gerencie reuniões com score de efetividade
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Reunião
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            <span className="text-gray-400 text-sm">Total de Reuniões</span>
          </div>
          <div className="text-2xl font-bold">{meetings.length}</div>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <span className="text-gray-400 text-sm">Score Médio</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{avgScore}</span>
            <EffectivenessScore score={avgScore} showLabel={false} size="sm" />
          </div>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-purple-400" />
            <span className="text-gray-400 text-sm">Total de Outputs</span>
          </div>
          <div className="text-2xl font-bold">{totalOutputs}</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar reuniões..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Meetings List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando reuniões...</div>
      ) : filteredMeetings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma reunião encontrada</h3>
          <p className="text-sm text-gray-400 mb-4">
            {search
              ? "Tente ajustar os filtros"
              : "Registre sua primeira reunião para começar"}
          </p>
          {!search && (
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Reunião
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              onClick={() => handleEditClick(meeting)}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-5 cursor-pointer hover:border-slate-600 transition-colors"
            >
              {/* Header Row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm text-gray-400 font-mono">{meeting.code}</span>
                    <EffectivenessScore score={meeting.effectivenessScore} />
                  </div>
                  <h3 className="text-xl font-semibold">{meeting.title}</h3>
                  {meeting.relatedProject && (
                    <p className="text-sm text-gray-400 mt-1">
                      Projeto: {meeting.relatedProject.code} - {meeting.relatedProject.name}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    {new Date(meeting.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Outputs */}
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="bg-slate-900/50 rounded-md p-2 text-center">
                  <div className="text-xs text-gray-400 mb-1">Decisões</div>
                  <div className="text-lg font-bold text-blue-300">{meeting.decisionsCount}</div>
                </div>
                <div className="bg-slate-900/50 rounded-md p-2 text-center">
                  <div className="text-xs text-gray-400 mb-1">Ações</div>
                  <div className="text-lg font-bold text-green-300">{meeting.actionsCount}</div>
                </div>
                <div className="bg-slate-900/50 rounded-md p-2 text-center">
                  <div className="text-xs text-gray-400 mb-1">Kaizens</div>
                  <div className="text-lg font-bold text-yellow-300">{meeting.kaizensCount}</div>
                </div>
                <div className="bg-slate-900/50 rounded-md p-2 text-center">
                  <div className="text-xs text-gray-400 mb-1">Bloqueios</div>
                  <div className="text-lg font-bold text-red-300">{meeting.blockersCount}</div>
                </div>
              </div>

              {/* Notes Preview */}
              {meeting.notes && (
                <div className="text-sm text-gray-400 line-clamp-2 border-t border-slate-700/50 pt-3">
                  {meeting.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateMeetingModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      
      <EditMeetingModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedMeeting(null);
        }}
        onSuccess={handleEditSuccess}
        meeting={selectedMeeting}
      />
    </div>
  );
}

