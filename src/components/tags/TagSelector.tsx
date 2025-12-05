"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateTagModal } from "./CreateTagModal";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagSelectorProps {
  taskId?: string;
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

export function TagSelector({ taskId, selectedTags, onTagsChange }: TagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      const data = await response.json();
      if (data.success && data.data) {
        setAvailableTags(data.data);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const handleAddTag = async (tag: Tag) => {
    if (taskId) {
      // If we have a taskId, add tag via API
      try {
        const response = await fetch(`/api/tasks/${taskId}/tags`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tag_id: tag.id }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Erro ao adicionar tag");
        }
      } catch (error) {
        console.error("Error adding tag:", error);
        alert(error instanceof Error ? error.message : "Erro ao adicionar tag");
        return;
      }
    }

    // Update local state
    onTagsChange([...selectedTags, tag]);
  };

  const handleRemoveTag = async (tag: Tag) => {
    if (taskId) {
      // If we have a taskId, remove tag via API
      try {
        const response = await fetch(`/api/tasks/${taskId}/tags?tag_id=${tag.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Erro ao remover tag");
        }
      } catch (error) {
        console.error("Error removing tag:", error);
        alert(error instanceof Error ? error.message : "Erro ao remover tag");
        return;
      }
    }

    // Update local state
    onTagsChange(selectedTags.filter((t) => t.id !== tag.id));
  };

  const unselectedTags = availableTags.filter(
    (tag) => !selectedTags.some((st) => st.id === tag.id)
  );

  return (
    <div className="space-y-3">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: tag.color + "20",
                color: tag.color,
                borderColor: tag.color,
                borderWidth: "1px",
              }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Available Tags */}
      {unselectedTags.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Tags disponíveis:</p>
          <div className="flex flex-wrap gap-2">
            {unselectedTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: tag.color + "20",
                  color: tag.color,
                  borderColor: tag.color,
                  borderWidth: "1px",
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create New Tag Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowCreateModal(true);
        }}
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        Criar Nova Tag
      </Button>

      {/* Create Tag Modal - Rendered outside to avoid nested forms */}
      {showCreateModal && (
        <CreateTagModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={() => {
            fetchTags();
          }}
        />
      )}
    </div>
  );
}
