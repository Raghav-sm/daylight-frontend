import type { ReactNode } from 'react';
import { QueryProvider } from '@/providers/query-provider';
import { AppShell } from '@/components/layout/app-shell';

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AppShell>{children}</AppShell>
    </QueryProvider>
  );
}
