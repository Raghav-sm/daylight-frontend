import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { WorkspaceAuthGate } from '@/components/auth/workspace-auth-gate';

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <WorkspaceAuthGate><AppShell>{children}</AppShell></WorkspaceAuthGate>;
}
