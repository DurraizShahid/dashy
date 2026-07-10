"use client";

import {
  createContext,
  useContext,
  useMemo,
} from "react";
import { createClient, type HiveMindClient } from "./client";

interface HiveMindContextValue {
  client: HiveMindClient | null;
  error: string | null;
  isReady: boolean;
}

function createInitialState(): HiveMindContextValue {
  try {
    const client = createClient();
    return { client, error: null, isReady: true };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Unknown error initializing Hive Mind client";
    return { client: null, error: message, isReady: false };
  }
}

const HiveMindContext = createContext<HiveMindContextValue>({
  client: null,
  error: null,
  isReady: false,
});

interface HiveMindProviderProps {
  children: React.ReactNode;
}

export function HiveMindProvider({ children }: HiveMindProviderProps) {
  const state = useMemo(() => createInitialState(), []);

  return (
    <HiveMindContext.Provider value={state}>
      {children}
    </HiveMindContext.Provider>
  );
}

export function useHiveMindClient(): HiveMindContextValue {
  return useContext(HiveMindContext);
}
