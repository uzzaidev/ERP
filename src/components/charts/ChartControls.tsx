"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  LineChart as LineChartIcon,
  Settings2,
  Download,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export interface ChartMetric {
  key: string;
  label: string;
  color: string;
  enabled: boolean;
}

export interface ChartControlsProps {
  metrics: ChartMetric[];
  onMetricsChange: (metrics: ChartMetric[]) => void;
  chartType: "line" | "bar" | "area";
  onChartTypeChange: (type: "line" | "bar" | "area") => void;
  chartHeight?: number;
  onHeightChange?: (height: number) => void;
  onExport?: () => void;
}

const PRESET_COLORS = [
  "#8b5cf6", // purple
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export function ChartControls({
  metrics,
  onMetricsChange,
  chartType,
  onChartTypeChange,
  chartHeight = 400,
  onHeightChange,
  onExport,
}: ChartControlsProps) {
  const [localHeight, setLocalHeight] = useState(chartHeight);

  const handleMetricToggle = (key: string, enabled: boolean) => {
    const updated = metrics.map((m) =>
      m.key === key ? { ...m, enabled } : m
    );
    onMetricsChange(updated);
  };

  const handleColorChange = (key: string, color: string) => {
    const updated = metrics.map((m) => (m.key === key ? { ...m, color } : m));
    onMetricsChange(updated);
  };

  const handleHeightChange = (value: number[]) => {
    setLocalHeight(value[0]);
    onHeightChange?.(value[0]);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Chart Type Selector */}
      <div className="flex items-center gap-1 border rounded-md p-1">
        <Button
          variant={chartType === "line" ? "default" : "ghost"}
          size="sm"
          onClick={() => onChartTypeChange("line")}
          className="h-8 px-2"
        >
          <LineChartIcon className="h-4 w-4" />
        </Button>
        <Button
          variant={chartType === "bar" ? "default" : "ghost"}
          size="sm"
          onClick={() => onChartTypeChange("bar")}
          className="h-8 px-2"
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
        <Button
          variant={chartType === "area" ? "default" : "ghost"}
          size="sm"
          onClick={() => onChartTypeChange("area")}
          className="h-8 px-2"
        >
          <BarChart3 className="h-4 w-4 fill-current" />
        </Button>
      </div>

      {/* Metrics & Customization Settings */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Settings2 className="h-4 w-4 mr-2" />
            Personalizar
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            {/* Metrics Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Métricas</Label>
              {metrics.map((metric) => (
                <div
                  key={metric.key}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Checkbox
                      id={metric.key}
                      checked={metric.enabled}
                      onCheckedChange={(checked) =>
                        handleMetricToggle(metric.key, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={metric.key}
                      className="text-sm cursor-pointer"
                    >
                      {metric.label}
                    </Label>
                  </div>
                  {metric.enabled && (
                    <Select
                      value={metric.color}
                      onValueChange={(color) =>
                        handleColorChange(metric.key, color)
                      }
                    >
                      <SelectTrigger className="w-20 h-8">
                        <div
                          className="w-4 h-4 rounded-sm border"
                          style={{ backgroundColor: metric.color }}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {PRESET_COLORS.map((color) => (
                          <SelectItem key={color} value={color}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-sm border"
                                style={{ backgroundColor: color }}
                              />
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>

            {/* Height Adjustment */}
            {onHeightChange && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Altura: {localHeight}px
                </Label>
                <Slider
                  value={[localHeight]}
                  onValueChange={handleHeightChange}
                  min={200}
                  max={800}
                  step={50}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Export Button */}
      {onExport && (
        <Button variant="outline" size="sm" className="h-8" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      )}
    </div>
  );
}
