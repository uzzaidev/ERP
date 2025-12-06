"use client";

import { useState, useEffect } from "react";
import { Gauge } from "lucide-react";
import { BurndownChart, VelocityChart } from "@/components/charts";
import { ExportSprintPDF } from "@/components/sprints";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Sprint {
  id: string;
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
}

export default function PerformancePageContent() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<string | null>(null);

  useEffect(() => {
    fetchSprints();
  }, []);

  const fetchSprints = async () => {
    try {
      const response = await fetch("/api/sprints");
      const result = await response.json();

      if (result.success && result.data) {
        setSprints(result.data);
        
        // Find active sprint or use most recent
        const active = result.data.find((s: Sprint) => s.status === "active");
        if (active) {
          setActiveSprint(active.id);
        } else if (result.data.length > 0) {
          setActiveSprint(result.data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching sprints:", error);
    }
  };

  const activeSprintData = sprints.find(s => s.id === activeSprint);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Gauge className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Performance & Analytics
              </h1>
              <p className="text-muted-foreground">
                Métricas e indicadores para tomada de decisão
              </p>
            </div>
          </div>
          {activeSprintData && (
            <ExportSprintPDF 
              sprintId={activeSprintData.id}
              sprintCode={activeSprintData.code}
            />
          )}
        </div>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="velocity" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="velocity">Velocidade</TabsTrigger>
          <TabsTrigger value="burndown">Burndown</TabsTrigger>
        </TabsList>

        <TabsContent value="velocity" className="space-y-6">
          <VelocityChart limit={6} />
        </TabsContent>

        <TabsContent value="burndown" className="space-y-6">
          <BurndownChart
            sprintId={activeSprint || undefined}
            sprints={sprints}
            onSprintChange={setActiveSprint}
          />
        </TabsContent>
      </Tabs>

      {/* Future OKRs Section Placeholder */}
      <div className="mt-8 p-6 border border-dashed rounded-lg bg-muted/30">
        <h3 className="text-lg font-semibold mb-2">Em Breve: OKRs & KPIs</h3>
        <p className="text-sm text-muted-foreground">
          Scorecards temáticos, insights com RAG e modo de apresentação para reuniões.
        </p>
      </div>
    </div>
  );
}
