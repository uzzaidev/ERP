"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ChartControls,
  ChartMetric,
} from "@/components/charts/ChartControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, TrendingDown } from "lucide-react";

interface BurndownData {
  date: string;
  ideal: number;
  actual: number;
  completed: number;
}

interface SprintInfo {
  id: string;
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface BurndownChartProps {
  sprintId?: string;
  sprints?: SprintInfo[];
  onSprintChange?: (sprintId: string) => void;
}

const DEFAULT_METRICS: ChartMetric[] = [
  { key: "ideal", label: "Ideal", color: "#94a3b8", enabled: true },
  { key: "actual", label: "Real", color: "#8b5cf6", enabled: true },
  { key: "completed", label: "Concluído", color: "#10b981", enabled: false },
];

export function BurndownChart({
  sprintId,
  sprints = [],
  onSprintChange,
}: BurndownChartProps) {
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(
    sprintId || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BurndownData[]>([]);
  const [sprint, setSprint] = useState<SprintInfo | null>(null);
  const [metrics, setMetrics] = useState<ChartMetric[]>(DEFAULT_METRICS);
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("line");
  const [chartHeight, setChartHeight] = useState(400);
  const [totalHours, setTotalHours] = useState(0);
  const [completedHours, setCompletedHours] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    if (selectedSprintId) {
      fetchBurndownData(selectedSprintId);
    }
  }, [selectedSprintId]);

  const fetchBurndownData = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sprints/${id}/burndown`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erro ao carregar dados");
      }

      setData(result.data.burndownData);
      setSprint(result.data.sprint);
      setTotalHours(result.data.totalHours);
      setCompletedHours(result.data.completedHours);
      setProgressPercentage(result.data.metrics.progressPercentage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleSprintChange = (id: string) => {
    setSelectedSprintId(id);
    onSprintChange?.(id);
  };

  const handleExport = () => {
    // Export chart as CSV
    const csv = [
      ["Data", "Ideal", "Real", "Concluído"],
      ...data.map((d) => [d.date, d.ideal, d.actual, d.completed]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `burndown-${sprint?.code || "chart"}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const enabledMetrics = metrics.filter((m) => m.enabled);

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const axes = (
      <>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getDate()}/${date.getMonth() + 1}`;
          }}
          className="text-xs"
        />
        <YAxis className="text-xs" label={{ value: "Horas", angle: -90, position: "insideLeft" }} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("pt-BR");
              }}
            />
          }
        />
        <Legend />
      </>
    );

    if (chartType === "line") {
      return (
        <LineChart {...commonProps}>
          {axes}
          {enabledMetrics.map((metric) => (
            <Line
              key={metric.key}
              type="monotone"
              dataKey={metric.key}
              stroke={metric.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              name={metric.label}
            />
          ))}
        </LineChart>
      );
    }

    if (chartType === "bar") {
      return (
        <BarChart {...commonProps}>
          {axes}
          {enabledMetrics.map((metric) => (
            <Bar
              key={metric.key}
              dataKey={metric.key}
              fill={metric.color}
              name={metric.label}
            />
          ))}
        </BarChart>
      );
    }

    return (
      <AreaChart {...commonProps}>
        {axes}
        {enabledMetrics.map((metric) => (
          <Area
            key={metric.key}
            type="monotone"
            dataKey={metric.key}
            stroke={metric.color}
            fill={metric.color}
            fillOpacity={0.3}
            name={metric.label}
          />
        ))}
      </AreaChart>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-purple-500" />
              Burndown Chart
            </CardTitle>
            {sprint && (
              <p className="text-sm text-muted-foreground">
                {sprint.code} - {sprint.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {sprints.length > 0 && (
              <Select
                value={selectedSprintId || undefined}
                onValueChange={handleSprintChange}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecione uma sprint" />
                </SelectTrigger>
                <SelectContent>
                  {sprints.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <ChartControls
              metrics={metrics}
              onMetricsChange={setMetrics}
              chartType={chartType}
              onChartTypeChange={setChartType}
              chartHeight={chartHeight}
              onHeightChange={setChartHeight}
              onExport={handleExport}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-[400px] text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && !selectedSprintId && (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            Selecione uma sprint para visualizar o burndown
          </div>
        )}

        {!loading && !error && selectedSprintId && data.length === 0 && (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            Sem dados para esta sprint
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <>
            {/* Metrics Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Estimado</p>
                <p className="text-2xl font-bold">{totalHours}h</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Concluído</p>
                <p className="text-2xl font-bold">{completedHours}h</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Progresso</p>
                <p className="text-2xl font-bold">{progressPercentage}%</p>
              </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={chartHeight}>
              {renderChart()}
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
