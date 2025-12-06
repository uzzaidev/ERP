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
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  ChartControls,
  ChartMetric,
} from "@/components/charts/ChartControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VelocityData {
  sprintCode: string;
  sprintName: string;
  startDate: string;
  endDate: string;
  planned: number;
  completed: number;
  velocity: number;
}

interface VelocityMetrics {
  avgVelocity: number;
  avgPlanned: number;
  avgCompleted: number;
  totalSprints: number;
  trend: "improving" | "stable" | "declining";
}

interface VelocityChartProps {
  projectId?: string;
  limit?: number;
}

const DEFAULT_METRICS: ChartMetric[] = [
  { key: "planned", label: "Planejado", color: "#94a3b8", enabled: true },
  { key: "completed", label: "Concluído", color: "#10b981", enabled: true },
  { key: "velocity", label: "Velocidade %", color: "#8b5cf6", enabled: false },
];

const chartConfig = {
  planned: {
    label: "Planejado",
    color: "#94a3b8",
  },
  completed: {
    label: "Concluído",
    color: "#10b981",
  },
  velocity: {
    label: "Velocidade %",
    color: "#8b5cf6",
  },
} satisfies ChartConfig;

export function VelocityChart({ projectId, limit = 6 }: VelocityChartProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VelocityData[]>([]);
  const [metricsData, setMetricsData] = useState<VelocityMetrics | null>(null);
  const [metrics, setMetrics] = useState<ChartMetric[]>(DEFAULT_METRICS);
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("bar");
  const [chartHeight, setChartHeight] = useState(400);

  useEffect(() => {
    fetchVelocityData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, limit]);

  const fetchVelocityData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (projectId) params.append("project_id", projectId);
      params.append("limit", limit.toString());

      const response = await fetch(`/api/analytics/velocity?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erro ao carregar dados");
      }

      setData(result.data.velocityData);
      setMetricsData(result.data.metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Export chart as CSV
    const csv = [
      ["Sprint", "Planejado", "Concluído", "Velocidade %"],
      ...data.map((d) => [d.sprintCode, d.planned, d.completed, d.velocity]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `velocity-chart.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const enabledMetrics = metrics.filter((m) => m.enabled);

  const getTrendIcon = () => {
    if (!metricsData) return null;
    switch (metricsData.trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendBadge = () => {
    if (!metricsData) return null;
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      improving: "default",
      stable: "secondary",
      declining: "destructive",
    };
    const labels = {
      improving: "Melhorando",
      stable: "Estável",
      declining: "Declinando",
    };
    return (
      <Badge variant={variants[metricsData.trend]} className="gap-1">
        {getTrendIcon()}
        {labels[metricsData.trend]}
      </Badge>
    );
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const axes = (
      <>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="sprintCode"
          className="text-xs"
        />
        <YAxis className="text-xs" label={{ value: "Horas", angle: -90, position: "insideLeft" }} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => {
                const sprint = data.find(d => d.sprintCode === value);
                return sprint ? sprint.sprintName : value;
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
              dot={{ r: 4 }}
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
              <Zap className="h-5 w-5 text-amber-500" />
              Velocidade do Time
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Últimas {limit} sprints concluídas
            </p>
          </div>
          <div className="flex items-center gap-4">
            {getTrendBadge()}
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
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-[400px] text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
            <p className="text-lg font-medium mb-2">Sem dados disponíveis</p>
            <p className="text-sm">Complete algumas sprints para ver a velocidade do time</p>
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <>
            {/* Metrics Summary */}
            {metricsData && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Sprints</p>
                  <p className="text-2xl font-bold">{metricsData.totalSprints}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Média Planejado</p>
                  <p className="text-2xl font-bold">{metricsData.avgPlanned}h</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Média Concluído</p>
                  <p className="text-2xl font-bold">{metricsData.avgCompleted}h</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Velocidade Média</p>
                  <p className="text-2xl font-bold">{metricsData.avgVelocity}%</p>
                </div>
              </div>
            )}

            {/* Chart */}
            <ChartContainer config={chartConfig} style={{ height: chartHeight }}>
              {renderChart()}
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
