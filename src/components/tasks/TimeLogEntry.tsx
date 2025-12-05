"use client";

import { useState, useEffect } from "react";
import { Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimeLog } from "@/types/entities";

interface TimeLogEntryProps {
  taskId: string;
  onTimeLogged?: (totalHours: number) => void;
}

export function TimeLogEntry({ taskId, onTimeLogged }: TimeLogEntryProps) {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [loggedDate, setLoggedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Fetch time logs
  useEffect(() => {
    if (taskId) {
      fetchTimeLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const fetchTimeLogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tasks/${taskId}/time-logs`);
      const result = await response.json();

      if (result.success) {
        setTimeLogs(result.data || []);
        const total = calculateTotalHours(result.data || []);
        onTimeLogged?.(total);
        setError(null);
      } else {
        setError(result.error || "Failed to load time logs");
      }
    } catch (err) {
      console.error("Error fetching time logs:", err);
      setError("Failed to load time logs");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalHours = (logs: TimeLog[]): number => {
    return logs.reduce((sum, log) => sum + (log.hours || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      setError("Horas deve ser maior que 0");
      return;
    }

    if (hoursNum > 24) {
      setError("Horas não podem exceder 24 por dia");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}/time-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hours: hoursNum,
          description: description.trim() || null,
          logged_date: loggedDate,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const updatedLogs = [...timeLogs, result.data];
        setTimeLogs(updatedLogs);
        const total = calculateTotalHours(updatedLogs);
        onTimeLogged?.(total);
        
        // Reset form
        setHours("");
        setDescription("");
        setLoggedDate(new Date().toISOString().split("T")[0]);
        setShowForm(false);
      } else {
        setError(result.error || "Failed to log time");
      }
    } catch (err) {
      console.error("Error logging time:", err);
      setError("Failed to log time");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const totalHours = calculateTotalHours(timeLogs);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-card-foreground">
            Registro de Tempo
          </h3>
          {totalHours > 0 && (
            <span className="text-xs text-muted-foreground">
              (Total: {totalHours.toFixed(1)}h)
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm(!showForm)}
          className="h-7 text-xs border-border bg-background hover:bg-muted"
        >
          <Plus className="h-3 w-3 mr-1" />
          Registrar
        </Button>
      </div>

      {/* New time log form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="hours" className="text-xs text-card-foreground">
                Horas *
              </Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0.0"
                required
                className="mt-1 h-8 text-sm bg-background border-input"
              />
            </div>
            <div>
              <Label htmlFor="logged_date" className="text-xs text-card-foreground">
                Data
              </Label>
              <Input
                id="logged_date"
                type="date"
                value={loggedDate}
                onChange={(e) => setLoggedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="mt-1 h-8 text-sm bg-background border-input"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-xs text-card-foreground">
              Descrição (opcional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="O que você fez neste tempo?"
              className="mt-1 min-h-[60px] text-sm bg-background border-input resize-none"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setHours("");
                setDescription("");
                setError(null);
              }}
              className="h-7 text-xs border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-7 text-xs bg-primary text-primary-foreground"
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      )}

      {/* Time logs list */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Carregando registros...
          </p>
        ) : timeLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum registro de tempo ainda.
          </p>
        ) : (
          timeLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between p-2 bg-muted/50 rounded border border-border/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-card-foreground">
                    {log.hours}h
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {log.user?.full_name || "Usuário"}
                  </span>
                </div>
                {log.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {log.description}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(log.loggedDate)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
