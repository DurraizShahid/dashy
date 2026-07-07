/**
 * HiveMindContext — tenant and project selection for Hive Mind API calls.
 *
 * Provides a lightweight way for users to set their active tenant/project.
 * Since backend list endpoints (/api/v1/tenants, /api/v1/projects) may not
 * exist yet, users can enter tenant/project IDs manually in settings.
 *
 * This is a UX preference only — the backend remains the source of truth.
 * Context values are NOT used to bypass auth.
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
interface HiveMindContextValue {
  tenantId: string;
  projectId: string;
  tenantName: string;
  projectName: string;
  setTenant: (id: string, name?: string) => void;
  setProject: (id: string, name?: string) => void;
  resetContext: () => void;
}

const defaultContext: HiveMindContextValue = {
  tenantId: "",
  projectId: "",
  tenantName: "",
  projectName: "",
  setTenant: () => {},
  setProject: () => {},
  resetContext: () => {},
};

const TenantProjectCtx = createContext<HiveMindContextValue>(defaultContext);

export function HiveMindTenantProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projectName, setProjectName] = useState("");

  const setTenant = useCallback((id: string, name?: string) => {
    setTenantId(id);
    if (name !== undefined) setTenantName(name);
  }, []);

  const setProject = useCallback((id: string, name?: string) => {
    setProjectId(id);
    if (name !== undefined) setProjectName(name);
  }, []);

  const resetContext = useCallback(() => {
    setTenantId("");
    setTenantName("");
    setProjectId("");
    setProjectName("");
  }, []);

  return (
    <TenantProjectCtx.Provider
      value={{
        tenantId,
        projectId,
        tenantName,
        projectName,
        setTenant,
        setProject,
        resetContext,
      }}
    >
      {children}
    </TenantProjectCtx.Provider>
  );
}

/**
 * Hook to access and modify the current tenant/project context.
 */
export function useTenantProject(): HiveMindContextValue {
  return useContext(TenantProjectCtx);
}

/**
 * Helper to build a request object with tenant/project context injected.
 */
export function withContext<T extends Record<string, unknown>>(
  base: T,
  context: HiveMindContextValue
): T & { tenantId?: string; projectId?: string } {
  return {
    ...base,
    ...(context.tenantId ? { tenantId: context.tenantId } : {}),
    ...(context.projectId ? { projectId: context.projectId } : {}),
  };
}
