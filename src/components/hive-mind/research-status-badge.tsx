"use client";

import { cn } from "@/lib/utils";
import { statusIcon, statusStyles } from "@/lib/hive-mind/status-config";
import type { ComponentType } from "react";

interface ResearchStatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
  iconSize?: string;
  animate?: boolean;
}

export function ResearchStatusBadge({ status, className, showIcon = true, iconSize = "size-4", animate }: ResearchStatusBadgeProps) {
  const Icon = (statusIcon[status] ?? statusIcon.queued) as ComponentType<{ className?: string }> | undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        statusStyles[status],
        className
      )}
    >
      {showIcon && Icon && (
        <Icon
          className={cn(
            iconSize,
            "shrink-0 mr-1",
            status === "completed" && "text-green-600",
            status === "failed" && "text-destructive",
            (status === "indexing" || status === "summarizing") && "text-amber-500",
            status === "queued" && "text-blue-500",
            status === "cancelled" && "text-muted-foreground",
            (status === "planning" || status === "searching" || status === "crawling") && "text-purple-500",
            animate && (status === "indexing" || status === "summarizing" || status === "planning" || status === "searching" || status === "crawling") && "animate-spin"
          )}
        />
      )}
      {status}
    </span>
  );
}
