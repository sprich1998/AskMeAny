"use client";

import { createContext, useContext } from "react";
import type { BrowserSession } from "@/types";

type SessionContextValue = {
  session: BrowserSession | null;
  setSession: (session: BrowserSession) => void;
  loading: boolean;
  error: string | null;
  workflowRefreshKey: number;
  bumpWorkflowRefresh: () => void;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSessionContext(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSessionContext must be used within SessionProvider");
  }
  return ctx;
}
