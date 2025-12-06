"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { SprintReportPDF } from "./SprintReportPDF";

interface ExportSprintPDFProps {
  sprintId: string;
  sprintCode: string;
}

export function ExportSprintPDF({ sprintId, sprintCode }: ExportSprintPDFProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    
    try {
      // Fetch sprint data
      const sprintRes = await fetch(`/api/sprints/${sprintId}`);
      const sprintData = await sprintRes.json();

      if (!sprintData.success) {
        throw new Error("Erro ao buscar dados da sprint");
      }

      const sprint = sprintData.data;

      // Fetch tasks from sprint
      const tasksRes = await fetch(`/api/tasks?sprint_id=${sprintId}`);
      const tasksData = await tasksRes.json();

      if (!tasksData.success) {
        throw new Error("Erro ao buscar tarefas da sprint");
      }

      const tasks = tasksData.data || [];

      // Calculate metrics
      const completedTasks = tasks.filter((t: { status: string }) => t.status === "done");
      const plannedHours = tasks.reduce((sum: number, t: { estimated_hours: number | null }) => 
        sum + (t.estimated_hours || 0), 0
      );
      const completedHours = completedTasks.reduce((sum: number, t: { estimated_hours: number | null }) => 
        sum + (t.estimated_hours || 0), 0
      );
      const velocity = plannedHours > 0 
        ? Math.round((completedHours / plannedHours) * 100) 
        : 0;

      const reportData = {
        sprint: {
          code: sprint.code,
          name: sprint.name,
          goal: sprint.goal,
          start_date: sprint.start_date,
          end_date: sprint.end_date,
          status: sprint.status,
        },
        tasks: tasks.map((t: {
          id: string;
          code: string;
          title: string;
          status: string;
          estimated_hours: number | null;
        }) => ({
          id: t.id,
          code: t.code,
          title: t.title,
          status: t.status,
          estimated_hours: t.estimated_hours,
        })),
        metrics: {
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          plannedHours: Math.round(plannedHours * 100) / 100,
          completedHours: Math.round(completedHours * 100) / 100,
          velocity,
        },
        retrospective: sprint.retrospective || "Nenhuma retrospectiva registrada.",
      };

      // Generate PDF
      const blob = await pdf(<SprintReportPDF data={reportData} />).toBlob();

      // Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sprint-${sprintCode}-report.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      alert(`PDF da sprint ${sprintCode} gerado com sucesso!`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Erro ao gerar PDF: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {loading ? "Gerando..." : "Exportar PDF"}
    </Button>
  );
}
