import type { ReactNode } from 'react';
import { WorkspaceDataProvider } from '@/providers/workspace-data-provider';
import { AppShell } from '@/components/layout/app-shell';

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <WorkspaceDataProvider><AppShell>{children}</AppShell></WorkspaceDataProvider>;
}
