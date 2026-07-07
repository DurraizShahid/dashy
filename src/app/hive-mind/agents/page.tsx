"use client";

import { useState } from "react";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { AuthGate } from "@/components/auth/auth-gate";
import { createClient } from "@/lib/hive-mind/client";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import {
  Bot,
  Loader2,
  Send,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

function AgentQueryForm() {
  const [query, setQuery] = useState("");
  const [contextKey, setContextKey] = useState("");
  const [contextValue, setContextValue] = useState("");
  const [response, setResponse] = useState<{
    answer: string;
    sources: string[];
    confidence: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const client = createClient();
      const context: Record<string, string> = {};
      if (contextKey.trim() && contextValue.trim()) {
        context[contextKey.trim()] = contextValue.trim();
      }
      const result = await client.queryAgentContext({
        query: q,
        context: Object.keys(context).length > 0 ? context : undefined,
      });
      setResponse(result);
    } catch (err) {
      if (err instanceof HiveMindApiError) {
        setError(`API error ${err.status}: ${err.statusText}`);
      } else if (err instanceof HiveMindNetworkError) {
        setError(err.message);
      } else {
        setError(
          err instanceof Error ? err.message : "Agent query failed"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[20px] bg-card p-6 shadow-card">
        <h3 className="font-poppins font-semibold text-foreground mb-1">
          Query Agent
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Ask a question or request context from a Hive Mind agent.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="agent-query"
              className="text-xs font-medium text-foreground mb-1 block"
            >
              Query
            </label>
            <textarea
              id="agent-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What information do you need?"
              rows={3}
              required
              className={cn(
                "w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none resize-none",
                "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="context-key"
                className="text-xs font-medium text-foreground mb-1 block"
              >
                Context key (optional)
              </label>
              <input
                id="context-key"
                type="text"
                value={contextKey}
                onChange={(e) => setContextKey(e.target.value)}
                placeholder="e.g., product"
                className={cn(
                  "h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm transition-colors outline-none",
                  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                )}
              />
            </div>
            <div>
              <label
                htmlFor="context-value"
                className="text-xs font-medium text-foreground mb-1 block"
              >
                Context value
              </label>
              <input
                id="context-value"
                type="text"
                value={contextValue}
                onChange={(e) => setContextValue(e.target.value)}
                placeholder="e.g., Dilivygo"
                className={cn(
                  "h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm transition-colors outline-none",
                  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                )}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className={cn(
              "inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-50 disabled:pointer-events-none"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Querying...
              </>
            ) : (
              <>
                <Send className="size-4" />
                Send Query
              </>
            )}
          </button>
        </form>
      </div>

      {/* Response */}
      {error && (
        <div className="rounded-[20px] bg-card p-4 shadow-card">
          <div className="flex items-start gap-2">
            <XCircle className="size-4 shrink-0 text-destructive mt-0.5" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {response && (
        <div className="rounded-[20px] bg-card p-6 shadow-card space-y-3">
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            <h3 className="font-poppins font-semibold text-foreground text-sm">
              Agent Response
            </h3>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                response.confidence >= 0.7
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : response.confidence >= 0.4
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              )}
            >
              {Math.round(response.confidence * 100)}% confidence
            </span>
          </div>

          <p className="text-sm text-foreground leading-relaxed">
            {response.answer}
          </p>

          {response.sources.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Sources
              </p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {response.sources.map((source, i) => (
                  <li key={i} className="truncate">
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HiveMindAgentsPage() {
  return (
    <>
      <CRMTopbar
        title="Agent Context"
        subtitle="Query Hive Mind agents for contextual information"
      />

      <div className="px-6 pb-6 max-w-2xl">
        <AuthGate
          title="Agent Query"
          description="Interact with Hive Mind agents to retrieve contextual information and insights."
        >
          <AgentQueryForm />
        </AuthGate>
      </div>
    </>
  );
}
