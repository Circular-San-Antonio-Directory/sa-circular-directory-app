'use client';

import { createContext, useContext } from 'react';
import type { ActionConfig } from '@/lib/getActions';

const ActionsContext = createContext<ActionConfig[]>([]);

export function ActionsProvider({
  actions,
  children,
}: {
  actions: ActionConfig[];
  children: React.ReactNode;
}) {
  return <ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>;
}

export function useActionsConfig(): ActionConfig[] {
  return useContext(ActionsContext);
}
