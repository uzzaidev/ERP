"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

// Constants
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const DEFAULT_TASK_DURATION_DAYS = 7;
const DATE_RANGE_PADDING_PERCENT = 0.05;

interface GanttTask {
  id: string;
  code: string;
  title: string;
  status: string;
  priority: string;
  assignee: {
    id: string;
    full_name: string;
  } | null;
  started_at: string | null;
  due_date: string | null;
  estimated_hours: number;
  completed_hours: number;
}

interface GanttChartProps {
  tasks: GanttTask[];
  projectStartDate?: string;
  projectEndDate?: string;
}

export function GanttChart({ tasks, projectStartDate, projectEndDate }: GanttChartProps) {
  // Filter tasks that have dates
  const tasksWithDates = useMemo(() => {
    return tasks.filter(task => task.started_at || task.due_date);
  }, [tasks]);

  // Calculate date range
  const { startDate, endDate, totalDays } = useMemo(() => {
    if (tasksWithDates.length === 0) {
      const today = new Date();
      const endDay = new Date(today);
      endDay.setDate(endDay.getDate() + 30);
      return {
        startDate: today,
        endDate: endDay,
        totalDays: 30
      };
    }

    const dates: Date[] = [];
    
    if (projectStartDate) dates.push(new Date(projectStartDate));
    if (projectEndDate) dates.push(new Date(projectEndDate));
    
    // Use reduce for single-pass min/max calculation
    const { minTime, maxTime } = tasksWithDates.reduce((acc, task) => {
      if (task.started_at) {
        const startTime = new Date(task.started_at).getTime();
        dates.push(new Date(task.started_at));
        acc.minTime = Math.min(acc.minTime, startTime);
        acc.maxTime = Math.max(acc.maxTime, startTime);
      }
      if (task.due_date) {
        const dueTime = new Date(task.due_date).getTime();
        dates.push(new Date(task.due_date));
        acc.minTime = Math.min(acc.minTime, dueTime);
        acc.maxTime = Math.max(acc.maxTime, dueTime);
      }
      return acc;
    }, { minTime: Infinity, maxTime: -Infinity });

    const minDate = new Date(minTime);
    const maxDate = new Date(maxTime);
    
    // Add padding on each side
    const range = maxDate.getTime() - minDate.getTime();
    const padding = range * DATE_RANGE_PADDING_PERCENT;
    
    const start = new Date(minDate.getTime() - padding);
    const end = new Date(maxDate.getTime() + padding);
    
    const days = Math.ceil((end.getTime() - start.getTime()) / MILLISECONDS_PER_DAY);

    return {
      startDate: start,
      endDate: end,
      totalDays: days
    };
  }, [tasksWithDates, projectStartDate, projectEndDate]);

  // Calculate task bar position and width
  const getTaskPosition = (task: GanttTask) => {
    const taskStart = task.started_at ? new Date(task.started_at) : new Date();
    const taskEnd = task.due_date 
      ? new Date(task.due_date) 
      : new Date(taskStart.getTime() + DEFAULT_TASK_DURATION_DAYS * MILLISECONDS_PER_DAY);

    const startOffset = Math.max(0, (taskStart.getTime() - startDate.getTime()) / MILLISECONDS_PER_DAY);
    const duration = (taskEnd.getTime() - taskStart.getTime()) / MILLISECONDS_PER_DAY;
    
    const leftPercent = (startOffset / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;

    return {
      left: `${Math.max(0, leftPercent)}%`,
      width: `${Math.max(1, widthPercent)}%`,
      startOffset,
      duration
    };
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      backlog: "bg-slate-500/30 border-slate-500",
      todo: "bg-blue-500/30 border-blue-500",
      "in-progress": "bg-purple-500/30 border-purple-500",
      review: "bg-yellow-500/30 border-yellow-500",
      done: "bg-emerald-500/30 border-emerald-500",
      blocked: "bg-red-500/30 border-red-500",
    };
    return colors[status] || colors.todo;
  };

  // Get priority indicator
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-slate-400",
      medium: "bg-blue-400",
      high: "bg-yellow-400",
      critical: "bg-red-400",
    };
    return colors[priority] || colors.medium;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  // Generate timeline markers
  const timelineMarkers = useMemo(() => {
    const markers: Date[] = [];
    const current = new Date(startDate);
    
    // Show markers every 7 days or adjust based on total days
    const step = totalDays > 90 ? 14 : totalDays > 30 ? 7 : 3;
    
    while (current <= endDate) {
      markers.push(new Date(current));
      current.setDate(current.getDate() + step);
    }
    
    return markers;
  }, [startDate, endDate, totalDays]);

  if (tasksWithDates.length === 0) {
    return (
      <Card className="border-slate-700/50 bg-slate-900/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <Calendar className="h-5 w-5" />
            Timeline do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-slate-500 mb-4" />
            <p className="text-slate-400 mb-2">Nenhuma tarefa com datas definidas</p>
            <p className="text-sm text-slate-500">
              Adicione datas de início e término às tarefas para visualizar o timeline
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-700/50 bg-slate-900/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <Calendar className="h-5 w-5" />
            Timeline do Projeto
          </CardTitle>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
            </div>
            <span>({totalDays} dias)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Timeline header */}
          <div className="relative h-8 border-b border-slate-700/50">
            {timelineMarkers.map((marker, index) => {
              const position = ((marker.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100;
              return (
                <div
                  key={index}
                  className="absolute top-0 flex flex-col items-center"
                  style={{ left: `${position}%` }}
                >
                  <div className="h-2 w-px bg-slate-600" />
                  <span className="text-xs text-slate-500 mt-1">
                    {formatDate(marker)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Task bars */}
          <div className="space-y-3">
            {tasksWithDates.map((task) => {
              const position = getTaskPosition(task);
              const progress = task.estimated_hours > 0 
                ? (task.completed_hours / task.estimated_hours) * 100 
                : 0;

              return (
                <div key={task.id} className="group relative">
                  {/* Task info */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`} />
                    <span className="text-xs font-mono text-slate-500">{task.code}</span>
                    <span className="text-sm text-slate-300 flex-1 truncate">{task.title}</span>
                    {task.assignee && (
                      <span className="text-xs text-slate-400">{task.assignee.full_name}</span>
                    )}
                  </div>

                  {/* Timeline bar */}
                  <div className="relative h-8 bg-slate-800/30 rounded-md">
                    <div
                      className={`absolute top-0 h-full rounded-md border-l-2 transition-all group-hover:opacity-80 ${getStatusColor(task.status)}`}
                      style={{
                        left: position.left,
                        width: position.width,
                      }}
                    >
                      {/* Progress indicator */}
                      {progress > 0 && (
                        <div
                          className="h-full bg-emerald-500/20 rounded-l-md"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      )}
                      
                      {/* Tooltip on hover */}
                      <div className="absolute hidden group-hover:flex flex-col gap-1 bottom-full left-0 mb-2 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 min-w-[250px]">
                        <div className="font-medium text-white">{task.title}</div>
                        <div className="text-xs text-slate-400">
                          {task.started_at && (
                            <div>Início: {new Date(task.started_at).toLocaleDateString('pt-BR')}</div>
                          )}
                          {task.due_date && (
                            <div>Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}</div>
                          )}
                          <div className="mt-1">
                            Duração: {Math.ceil(position.duration)} dias
                          </div>
                          {task.estimated_hours > 0 && (
                            <div>
                              Progresso: {task.completed_hours.toFixed(1)}h / {task.estimated_hours.toFixed(1)}h ({progress.toFixed(0)}%)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 pt-4 border-t border-slate-700/50 text-xs">
            <span className="text-slate-400">Status:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500" />
              <span className="text-slate-400">A fazer</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500" />
              <span className="text-slate-400">Em progresso</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-500/30 border border-yellow-500" />
              <span className="text-slate-400">Em revisão</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500" />
              <span className="text-slate-400">Concluído</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
