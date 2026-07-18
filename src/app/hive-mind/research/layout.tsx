"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrainCircuit, CalendarClock } from "lucide-react";
import { ErrorBoundary } from "@/components/hive-mind/error-boundary";

const tabs = [
  { label: "Research Runs", icon: BrainCircuit, href: "/hive-mind/research" },
  { label: "Research Schedules", icon: CalendarClock, href: "/hive-mind/research/schedules" },
];

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const activeTab = tabs.find((t) => {
    if (t.href === "/hive-mind/research") {
      return pathname === "/hive-mind/research" || pathname.startsWith("/hive-mind/research/") && !pathname.startsWith("/hive-mind/research/schedules");
    }
    return pathname.startsWith(t.href);
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Tab bar for runs / schedules */}
      <div className="flex items-center gap-1 rounded-xl bg-muted p-1 mx-6" role="tablist" aria-label="Research views">
        {tabs.map((tab) => {
          const isActive = activeTab?.href === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-lg text-xs font-medium transition-colors",
                isActive
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  );
}
