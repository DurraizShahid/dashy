/**
 * HiveMindProvider — provides a singleton API client via React context.
 *
 * The client routes all requests through the server-side proxy
 * (/api/hive-mind/*), so no tokens or API keys are needed on the client.
 *
 * Usage in root layout:
 *   <HiveMindProvider>
 *     {children}
 *   </HiveMindProvider>
 *
 * Then in any component:
 *   const client = useHiveMindClient();
 */

"use client";

import {
  createContext,
  useContext,
  useMemo,
} from "react";
import { createClient, type HiveMindClient } from "./client";
import { HiveMindConfigError } from "./errors";
import type { HiveMindClientConfig } from "./types";

interface HiveMindContextValue {
  client: HiveMindClient | null;
  error: string | null;
  isReady: boolean;
}

function createInitialState(
  config?: Partial<HiveMindClientConfig>
): HiveMindContextValue {
  try {
    const client = createClient(config);
    return { client, error: null, isReady: true };
  } catch (err) {
    const message =
      err instanceof HiveMindConfigError
        ? err.message
        : err instanceof Error
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
  /** Optional explicit config for testing or server-side usage. */
  config?: Partial<HiveMindClientConfig>;
}

export function HiveMindProvider({ children, config }: HiveMindProviderProps) {
  const state = useMemo(() => createInitialState(config), [config]);

  return (
    <HiveMindContext.Provider value={state}>
      {children}
    </HiveMindContext.Provider>
  );
}

/**
 * Access the Hive Mind API client from any component.
 * Returns { client, error, isReady }.
 *
 * The client routes through the server-side proxy which handles auth.
 * When not ready, `client` is null and `error` contains the message.
 */
export function useHiveMindClient(): HiveMindContextValue {
  return useContext(HiveMindContext);
}
