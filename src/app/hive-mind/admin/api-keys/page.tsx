"use client";

import { useState, useEffect, useCallback } from "react";
import { CRMTopbar } from "@/components/crm/crm-topbar";
import { useHiveMind } from "@/lib/hive-mind/hive-mind-context";
import { HiveMindApiError, HiveMindNetworkError } from "@/lib/hive-mind/errors";
import type { ApiKey } from "@/lib/hive-mind/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  XCircle,
  Key,
  Plus,
  Filter,
  Trash2,
  Copy,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SCOPES = [
  "system:admin",
  "tenants:admin",
  "admin:registry",
  "documents:read",
  "jobs:read",
  "knowledge:search",
  "agent:context",
  "ingestion:write",
] as const;

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  revoked: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  expired: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
};

function CreateApiKeyModal({
  open,
  onOpenChange,
  onCreated,
  tenantId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  tenantId: string | null;
}) {
  const { client, selectedTenant } = useHiveMind();
  const [name, setName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plaintextKey, setPlaintextKey] = useState<string | null>(null);

  function reset() {
    setName("");
    setSelectedScopes([]);
    setExpiresAt("");
    setError(null);
    setPlaintextKey(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!client || !name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await client.createApiKey({
        name: name.trim(),
        tenantId: tenantId ?? undefined,
        scopes: selectedScopes,
        expiresAt: expiresAt || undefined,
      });
      setPlaintextKey(res.plaintextKey);
    } catch (err) {
      if (err instanceof HiveMindApiError) {
        if (err.status === 403) setError("You do not have permission to create API keys.");
        else setError(`API error ${err.status}: ${err.statusText}`);
      } else if (err instanceof HiveMindNetworkError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Failed to create API key");
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleScope(scope: string) {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  }

  function handleClose() {
    if (plaintextKey) {
      setPlaintextKey(null);
    }
    reset();
    onOpenChange(false);
    if (plaintextKey) {
      onCreated();
    }
  }

  const hasSystemAdmin = selectedScopes.includes("system:admin");

  return (
    <Dialog open={open} onOpenChange={(next) => {
      if (!next) handleClose();
      else onOpenChange(next);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Create a new API key for programmatic access.
          </DialogDescription>
        </DialogHeader>

        {plaintextKey ? (
          <div className="space-y-4 py-2">
            <div className="rounded-xl border-2 border-green-500/30 bg-green-50 dark:bg-green-950/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="size-5 text-green-600" />
                <p className="text-sm font-medium text-foreground">API Key Created</p>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mb-2">
                This key will never be shown again. Copy it now.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-background px-3 py-2 text-xs font-mono break-all select-all">
                  {plaintextKey}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(plaintextKey)}
                  className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
                  title="Copy key"
                >
                  <Copy className="size-4" />
                </button>
              </div>
            </div>
            <DialogFooter showCloseButton>
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">
                Key Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., CI/CD pipeline key"
                required
                className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground"
              />
            </div>

            {tenantId && selectedTenant && (
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Organization
                </label>
                <p className="text-sm text-foreground">{selectedTenant.name}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">
                Scopes
              </label>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                {SCOPES.map((scope) => {
                  const isSelected = selectedScopes.includes(scope);
                  const isAdmin = scope === "system:admin";
                  return (
                    <label
                      key={scope}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors",
                        isSelected
                          ? isAdmin
                            ? "bg-red-50 dark:bg-red-950/20 ring-1 ring-red-300"
                            : "bg-muted"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleScope(scope)}
                        className="rounded border-input"
                      />
                      <div>
                        <span className="text-foreground">{scope}</span>
                        {isAdmin && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-red-600 font-medium">
                            <ShieldAlert className="size-3" />
                            Full system access
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
              {hasSystemAdmin && (
                <p className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                  <AlertTriangle className="size-3" />
                  This key has full system access. Consider scoping to a specific organization instead.
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">
                Expiration (optional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-foreground"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Recommended: set an expiration for temporary keys.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3">
                <XCircle className="size-4 shrink-0 text-destructive mt-0.5" />
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            )}

            <DialogFooter showCloseButton>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Create Key"
                )}
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RevokeDialog({
  open,
  onOpenChange,
  onRevoked,
  apiKey,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRevoked: () => void;
  apiKey: ApiKey | null;
}) {
  const { client } = useHiveMind();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRevoke() {
    if (!client || !apiKey) return;
    setLoading(true);
    setError(null);
    try {
      await client.revokeApiKey(apiKey.id, {
        reason: reason.trim() || undefined,
      });
      onRevoked();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof HiveMindApiError) {
        if (err.status === 404) setError("API key not found");
        else if (err.status === 403) setError("You do not have permission to revoke API keys");
        else setError(`API error ${err.status}: ${err.statusText}`);
      } else if (err instanceof HiveMindNetworkError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Failed to revoke API key");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to revoke <strong>{apiKey?.name}</strong>?
            This action cannot be undone. Any services using this key will lose access immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="px-4">
          <label className="text-xs font-medium text-foreground mb-1 block">
            Reason (optional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., key compromised, rotated"
            className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 px-4">
            <XCircle className="size-4 shrink-0 text-destructive mt-0.5" />
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel />
          <AlertDialogAction
            onClick={handleRevoke}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Revoke"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function HiveMindApiKeysPage() {
  const { client, selectedTenantId, selectedTenant } = useHiveMind();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
  const [showRevoked, setShowRevoked] = useState<string | null>(null);

  const fetchKeys = useCallback(
    async (cursor?: string) => {
      if (!client) return;
      setLoading(true);
      setError(null);
      try {
        const res = await client.listApiKeys({
          tenantId: selectedTenantId ?? undefined,
          status: statusFilter || undefined,
          cursor,
        });
        if (cursor) {
          setApiKeys((prev) => [...prev, ...res.apiKeys]);
        } else {
          setApiKeys(res.apiKeys);
        }
        setNextCursor(res.nextCursor ?? undefined);
      } catch (err) {
        if (err instanceof HiveMindApiError) {
          if (err.status === 403) setError("You do not have permission to manage API keys.");
          else setError(`API error ${err.status}: ${err.statusText}`);
        } else if (err instanceof HiveMindNetworkError) {
          setError(err.message);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load API keys");
        }
        if (!cursor) setApiKeys([]);
      } finally {
        setLoading(false);
      }
    },
    [client, selectedTenantId, statusFilter]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchKeys();
  }, [fetchKeys]);

  return (
    <>
      <CRMTopbar
        title="API Keys"
        subtitle={
          selectedTenant
            ? `Manage API keys for ${selectedTenant.name}`
            : "Manage API keys for programmatic access"
        }
      />

      <div className="px-6 pb-6 max-w-4xl space-y-4">
        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 text-foreground"
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="revoked">Revoked</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-3.5" />
            Create Key
          </button>
        </div>

        {/* Loading */}
        {loading && apiKeys.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
            <Loader2 className="size-4 animate-spin" />
            Loading API keys...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-[20px] bg-card p-4 shadow-card">
            <div className="flex items-start gap-2">
              <XCircle className="size-4 shrink-0 text-destructive mt-0.5" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && apiKeys.length === 0 && (
          <div className="rounded-[20px] bg-card p-6 shadow-card text-center">
            <Key className="size-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {statusFilter
                ? `No API keys with status "${statusFilter}".`
                : selectedTenantId
                  ? "No API keys yet. Create one to get started."
                  : "Select an organization to view API keys."}
            </p>
          </div>
        )}

        {/* Key list */}
        {apiKeys.length > 0 && (
          <div className="flex flex-col gap-2">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="rounded-xl bg-card p-4 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Key className={cn(
                      "size-5 shrink-0",
                      key.status === "active" ? "text-green-600" : "text-muted-foreground"
                    )} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {key.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                            statusStyles[key.status]
                          )}
                        >
                          {key.status}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {key.scopes.length} scope{key.scopes.length !== 1 ? "s" : ""}
                        </span>
                        {key.scopes.includes("system:admin") && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                            <ShieldAlert className="size-3" />
                            System admin
                          </span>
                        )}
                        {key.expiresAt && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="size-3" />
                            Expires {new Date(key.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {/* Scopes tooltip toggle */}
                    <button
                      onClick={() => setShowRevoked(showRevoked === key.id ? null : key.id)}
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title={showRevoked === key.id ? "Hide scopes" : "Show scopes"}
                    >
                      {showRevoked === key.id ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </button>

                    {key.status === "active" && (
                      <button
                        onClick={() => setRevokeTarget(key)}
                        className="flex size-7 items-center justify-center rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Revoke key"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded scopes */}
                {showRevoked === key.id && (
                  <div className="mt-3 pt-3 border-t border-muted">
                    <p className="text-[11px] font-medium text-muted-foreground mb-1">Scopes:</p>
                    <div className="flex flex-wrap gap-1">
                      {key.scopes.map((scope) => (
                        <span
                          key={scope}
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                            scope === "system:admin"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Created {new Date(key.createdAt).toLocaleString()}
                      {key.lastUsedAt && ` · Last used ${new Date(key.lastUsedAt).toLocaleString()}`}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load more */}
        {nextCursor && (
          <div className="text-center">
            <button
              onClick={() => fetchKeys(nextCursor)}
              disabled={loading}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium border border-input text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Load More"
              )}
            </button>
          </div>
        )}
      </div>

      <CreateApiKeyModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => {
          setApiKeys([]);
          setNextCursor(undefined);
          fetchKeys();
        }}
        tenantId={selectedTenantId}
      />

      <RevokeDialog
        open={revokeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null);
        }}
        onRevoked={() => {
          setRevokeTarget(null);
          fetchKeys();
        }}
        apiKey={revokeTarget}
      />
    </>
  );
}
