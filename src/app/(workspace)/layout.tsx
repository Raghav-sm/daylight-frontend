import type { ReactNode } from 'react';
import { WorkspaceDataProvider } from '@/components/workspace-data-provider';

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <WorkspaceDataProvider>{children}</WorkspaceDataProvider>;
}
