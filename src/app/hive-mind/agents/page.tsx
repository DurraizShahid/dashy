"use client";

import { useState } from "react";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { AuthGate } from "@/components/auth/auth-gate";
import { useHiveMindClient } from "@/lib/hive-mind/provider";
import { useTenantProject, withContext } from "@/lib/hive-mind/hive-mind-context";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import {
  Bot,
  Loader2,
  Send,
  XCircle,
  AlertTriangle,
  FileText,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentContextResponse } from "@/lib/hive-mind/types";

function AgentQueryForm() {
  const { client } = useHiveMindClient();
  const tenantCtx = useTenantProject();
  const [task, setTask] = useState("");
  const [agentType, setAgentType] = useState("general_agent");
  const [response, setResponse] = useState<AgentContextResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = task.trim();
    if (!t || !client) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await client.queryAgentContext(
        withContext(
          {
            task: t,
            agentType,
          },
          tenantCtx
        )
      );
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
              htmlFor="agent-task"
              className="text-xs font-medium text-foreground mb-1 block"
            >
              Task
            </label>
            <textarea
              id="agent-task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="What information do you need?"
              rows={3}
              required
              className={cn(
                "w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none resize-none",
                "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              )}
            />
          </div>

          <div>
            <label
              htmlFor="agent-type"
              className="text-xs font-medium text-foreground mb-1 block"
            >
              Agent Type
            </label>
            <select
              id="agent-type"
              value={agentType}
              onChange={(e) => setAgentType(e.target.value)}
              className={cn(
                "h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm transition-colors outline-none",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              )}
            >
              <option value="general_agent">General Agent</option>
              <option value="research_agent">Research Agent</option>
              <option value="support_agent">Support Agent</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !task.trim()}
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

      {/* Error */}
      {error && (
        <div className="rounded-[20px] bg-card p-4 shadow-card">
          <div className="flex items-start gap-2">
            <XCircle className="size-4 shrink-0 text-destructive mt-0.5" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="rounded-[20px] bg-card p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            <h3 className="font-poppins font-semibold text-foreground text-sm">
              Agent Response
            </h3>
          </div>

          {/* Mission */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Mission
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {response.mission}
            </p>
          </div>

          {/* Relevant Documents */}
          {response.relevantDocuments.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <FileText className="size-3" />
                Relevant Documents
              </p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {response.relevantDocuments.map((doc, i) => (
                  <li key={i} className="truncate">
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Relevant Chunks */}
          {response.relevantChunks.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Relevant Chunks
              </p>
              <div className="flex flex-col gap-2">
                {response.relevantChunks.map((chunk, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-muted/50 p-3"
                  >
                    <p className="text-xs text-foreground leading-relaxed">
                      {chunk.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-muted-foreground truncate">
                        {chunk.source}
                      </span>
                      {chunk.score !== undefined && (
                        <span className="text-[11px] text-muted-foreground">
                          Score: {chunk.score.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Citations */}
          {response.citations.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Quote className="size-3" />
                Citations
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {response.citations.map((citation, i) => (
                  <li key={i}>
                    {citation.title && (
                      <span className="font-medium">{citation.title}</span>
                    )}
                    {citation.url && (
                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline ml-1"
                      >
                        {citation.url}
                      </a>
                    )}
                    {citation.source && (
                      <span className="ml-1">({citation.source})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Retrieval Summary */}
          {response.retrievalSummary && (
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 p-3">
              <p className="text-xs text-muted-foreground">
                {response.retrievalSummary}
              </p>
            </div>
          )}

          {/* Warnings */}
          {response.warnings && response.warnings.length > 0 && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 p-3 flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                {response.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    {w}
                  </p>
                ))}
              </div>
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
