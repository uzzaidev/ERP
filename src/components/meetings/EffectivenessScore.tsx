import { MeetingEffectivenessInfo } from "@/types/entities";

interface EffectivenessScoreProps {
  score?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function getEffectivenessInfo(score?: number): MeetingEffectivenessInfo {
  const actualScore = score || 0;
  
  if (actualScore >= 80) {
    return {
      score: actualScore,
      level: "excellent",
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      label: "Excelente",
    };
  } else if (actualScore >= 60) {
    return {
      score: actualScore,
      level: "good",
      color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      label: "Bom",
    };
  } else if (actualScore >= 40) {
    return {
      score: actualScore,
      level: "fair",
      color: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      label: "Regular",
    };
  } else {
    return {
      score: actualScore,
      level: "poor",
      color: "bg-red-500/20 text-red-300 border-red-500/30",
      label: "Baixo",
    };
  }
}

export function EffectivenessScore({ 
  score, 
  size = "md",
  showLabel = true 
}: EffectivenessScoreProps) {
  const info = getEffectivenessInfo(score);
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };
  
  return (
    <div className={`inline-flex items-center gap-2 rounded-md border font-medium ${info.color} ${sizeClasses[size]}`}>
      <span className="font-bold">{info.score}</span>
      {showLabel && <span>{info.label}</span>}
    </div>
  );
}
