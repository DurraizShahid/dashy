"use client";

import { cn } from "@/lib/utils";
import type { ResearchSourceMode } from "@/lib/hive-mind/types";

const MODES: ResearchSourceMode[] = ["auto", "manual", "hybrid"];
const MODE_DESCRIPTIONS: Record<string, string> = {
  auto: "Automatically discover and crawl relevant sources.",
  manual: "Use only the URLs you provide.",
  hybrid: "Combine auto-discovered sources with your manual URLs.",
  mixed: "Automatically discover and crawl relevant sources.",
};

interface SourceModeSelectorProps {
  value: ResearchSourceMode;
  onChange: (mode: ResearchSourceMode) => void;
}

export function SourceModeSelector({ value, onChange }: SourceModeSelectorProps) {
  return (
    <div>
      <label className="text-xs font-medium text-foreground mb-1 block">
        Source Mode
      </label>
      <div
        className="flex gap-1 rounded-xl bg-muted p-1"
        role="radiogroup"
        aria-label="Source mode"
      >
        {MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={value === mode}
            onClick={() => onChange(mode)}
            onKeyDown={(e) => {
              const idx = MODES.indexOf(value);
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                const next = MODES[(idx + 1) % MODES.length];
                onChange(next);
              }
              if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                const prev = MODES[(idx - 1 + MODES.length) % MODES.length];
                onChange(prev);
              }
            }}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-2 h-8 rounded-lg text-xs font-medium capitalize transition-colors",
              value === mode
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {mode}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {MODE_DESCRIPTIONS[value]}
      </p>
    </div>
  );
}
