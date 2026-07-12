"use client";

import {
  Upload,
  FileText,
  Scissors,
  Cpu,
  CheckCircle2,
  Search,
  Loader2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PIPELINE_STEPS = [
  { key: "uploaded", label: "Uploaded", icon: Upload },
  { key: "parsed", label: "Parsed", icon: FileText },
  { key: "chunked", label: "Chunked", icon: Scissors },
  { key: "embedded", label: "Embedded", icon: Cpu },
  { key: "indexed", label: "Indexed", icon: CheckCircle2 },
  { key: "searchable", label: "Searchable", icon: Search },
] as const;

type PipelineStepKey = (typeof PIPELINE_STEPS)[number]["key"];

const STAGE_TO_STEP: Record<string, PipelineStepKey> = {
  "ingest.url": "uploaded",
  "ingest.file": "uploaded",
  "parse.document": "parsed",
  "chunk.document": "chunked",
  "index.vector": "embedded",
  completed: "searchable",
};

function getStepIndex(
  stage: string | null | undefined,
  status: string
): number {
  if (status === "failed") return -1;
  if (status === "pending") return -1;
  const stepKey = stage ? STAGE_TO_STEP[stage] : undefined;
  if (!stepKey) return status === "completed" ? PIPELINE_STEPS.length : -1;
  const idx = PIPELINE_STEPS.findIndex((s) => s.key === stepKey);
  if (status === "completed") return PIPELINE_STEPS.length;
  return idx;
}

interface PipelineVisualProps {
  stage?: string | null;
  status: string;
  className?: string;
}

export function PipelineVisual({ stage, status, className }: PipelineVisualProps) {
  const activeIndex = getStepIndex(stage, status);
  const isFailed = status === "failed";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {PIPELINE_STEPS.map((step, i) => {
        const Icon = step.icon;
        const isComplete = activeIndex > i || (activeIndex === -1 && status === "completed");
        const isCurrent = activeIndex === i;
        const isPending = !isComplete && !isCurrent;

        return (
          <div key={step.key} className="flex items-center gap-1">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                isComplete &&
                  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                isCurrent &&
                  !isFailed &&
                  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                isCurrent &&
                  isFailed &&
                  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                isPending &&
                  "bg-muted text-muted-foreground"
              )}
            >
              {isCurrent && isFailed ? (
                <XCircle className="size-3" />
              ) : isCurrent ? (
                <Loader2 className="size-3 animate-spin" />
              ) : isComplete ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <Icon className="size-3" />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <div
                className={cn(
                  "w-3 h-px",
                  isComplete ? "bg-green-300 dark:bg-green-700" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
