"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { createClient, type HiveMindClient } from "./client";
import type {
  MeResponse,
  Tenant,
  Project,
} from "./types";

interface HiveMindState {
  client: HiveMindClient | null;
  clientError: string | null;
  clientReady: boolean;

  currentUser: MeResponse | null;
  tenants: Tenant[];
  selectedTenantId: string | null;
  selectedTenant: Tenant | null;
  projects: Project[];
  selectedProjectId: string | null;
  selectedProject: Project | null;

  loading: boolean;
  error: string | null;

  refreshTenants: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  setSelectedTenantId: (id: string | null) => void;
  setSelectedProjectId: (id: string | null) => void;
}

const STORAGE_TENANT_KEY = "hm_tenant_id";
const STORAGE_PROJECT_KEY = "hm_project_id";

const HiveMindContext = createContext<HiveMindState>({
  client: null,
  clientError: null,
  clientReady: false,
  currentUser: null,
  tenants: [],
  selectedTenantId: null,
  selectedTenant: null,
  projects: [],
  selectedProjectId: null,
  selectedProject: null,
  loading: false,
  error: null,
  refreshTenants: async () => {},
  refreshProjects: async () => {},
  setSelectedTenantId: () => {},
  setSelectedProjectId: () => {},
});

function loadPreference(key: string, valid: Set<string>): string | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(key);
  if (stored && valid.has(stored)) return stored;
  return null;
}

export function HiveMindProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  });
  const [clientError] = useState<string | null>(null);
  const clientReady = client !== null;

  const [currentUser, setCurrentUser] = useState<MeResponse | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTenantId, setSelectedTenantIdState] = useState<string | null>(
    null
  );
  const [selectedProjectId, setSelectedProjectIdState] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const refreshTenants = useCallback(async () => {
    if (!client) return;
    setError(null);
    setLoading(true);
    try {
      const [me, tenantList] = await Promise.all([
        client.getMe(),
        client.listTenants(),
      ]);
      setCurrentUser(me);
      setTenants(tenantList);

      const validTenantIds = new Set(tenantList.map((t) => t.id));
      const stored = loadPreference(STORAGE_TENANT_KEY, validTenantIds);

      if (stored && validTenantIds.has(stored)) {
        setSelectedTenantIdState(stored);
      } else if (tenantList.length === 1) {
        setSelectedTenantIdState(tenantList[0].id);
      } else {
        setSelectedTenantIdState(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tenants");
      setCurrentUser(null);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }, [client]);

  const refreshProjects = useCallback(async () => {
    if (!client || !selectedTenantId) {
      setProjects([]);
      setSelectedProjectIdState(null);
      return;
    }
    try {
      const projectList = await client.listProjects({
        tenantId: selectedTenantId,
      });
      setProjects(projectList);

      const validProjectIds = new Set(projectList.map((p) => p.id));
      const stored = loadPreference(STORAGE_PROJECT_KEY, validProjectIds);

      if (stored && validProjectIds.has(stored)) {
        setSelectedProjectIdState(stored);
      } else if (projectList.length === 1) {
        setSelectedProjectIdState(projectList[0].id);
      } else {
        setSelectedProjectIdState(null);
      }
    } catch {
      setProjects([]);
      setSelectedProjectIdState(null);
    }
  }, [client, selectedTenantId]);

  const setSelectedTenantId = useCallback(
    (id: string | null) => {
      if (typeof window !== "undefined") {
        if (id) {
          localStorage.setItem(STORAGE_TENANT_KEY, id);
        } else {
          localStorage.removeItem(STORAGE_TENANT_KEY);
        }
      }
      setSelectedTenantIdState(id);
    },
    []
  );

  const setSelectedProjectId = useCallback(
    (id: string | null) => {
      if (typeof window !== "undefined") {
        if (id) {
          localStorage.setItem(STORAGE_PROJECT_KEY, id);
        } else {
          localStorage.removeItem(STORAGE_PROJECT_KEY);
        }
      }
      setSelectedProjectIdState(id);
    },
    []
  );

  useEffect(() => {
    if (!client || initializedRef.current) return;
    initializedRef.current = true;
    refreshTenants();
  }, [client, refreshTenants]);

  useEffect(() => {
    if (!initializedRef.current) return;
    refreshProjects();
  }, [selectedTenantId, refreshProjects]);

  const selectedTenant =
    tenants.find((t) => t.id === selectedTenantId) ?? null;
  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) ?? null;

  return (
    <HiveMindContext.Provider
      value={{
        client,
        clientError,
        clientReady,

        currentUser,
        tenants,
        selectedTenantId,
        selectedTenant,
        projects,
        selectedProjectId,
        selectedProject,

        loading,
        error,

        refreshTenants,
        refreshProjects,
        setSelectedTenantId,
        setSelectedProjectId,
      }}
    >
      {children}
    </HiveMindContext.Provider>
  );
}

export function useHiveMind(): HiveMindState {
  return useContext(HiveMindContext);
}
