"use client";

import { useState, useEffect } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TaskComment } from "@/types/entities";

interface TaskCommentsProps {
  taskId: string;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments
  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tasks/${taskId}/comments`);
      const result = await response.json();

      if (result.success) {
        setComments(result.data || []);
        setError(null);
      } else {
        setError(result.error || "Failed to load comments");
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment.trim(),
          mentions: [], // TODO: Implement @mentions detection
        }),
      });

      const result = await response.json();

      if (result.success) {
        setComments([...comments, result.data]);
        setNewComment("");
      } else {
        setError(result.error || "Failed to post comment");
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      setError("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "agora mesmo";
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-card-foreground">
          Comentários ({comments.length})
        </h3>
      </div>

      {/* Comments list */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Carregando comentários...
          </p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum comentário ainda. Seja o primeiro!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-muted/50 rounded-lg p-3 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-card-foreground">
                  {comment.author?.full_name || "Usuário"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-card-foreground whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* New comment form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escreva um comentário... (use @nome para mencionar alguém)"
          className="min-h-[80px] bg-background border-input text-foreground resize-none"
          disabled={isSubmitting}
        />
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !newComment.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? (
              "Enviando..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Comentar
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
