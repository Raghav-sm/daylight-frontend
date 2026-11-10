'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { ThemeMenu } from '@/components/layout/theme-menu';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useWorkspaceData } from '@/providers/workspace-data-provider';

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { id, taskId } = useParams<{ id?: string; taskId?: string }>();
  const { projects, tasks, loading, error, clearError, createProject } = useWorkspaceData();
  const selectedTask = tasks.find((task) => task.id === taskId);
  const activeProjectId = id ?? selectedTask?.projectId ?? null;
  const selectedProject = projects.find((project) => project.id === activeProjectId);
  const title = pathname === '/dashboard'
    ? 'Dashboard'
    : pathname.startsWith('/tasks/')
      ? selectedTask?.title ?? 'Details'
      : selectedProject?.name ?? 'Projects';

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar
        activePath={pathname}
        activeProjectId={activeProjectId}
        projects={projects}
        projectCounts={Object.fromEntries(projects.map((project) => [
          project.id,
          tasks.filter((task) => task.projectId === project.id && !task.completed).length,
        ]))}
        onProjectCreate={async (name, color) => {
          const project = await createProject(name, color);
          if (project) router.push(`/projects/${encodeURIComponent(project.id)}`);
          return project;
        }}
      />
      <SidebarInset className="min-h-svh min-w-0 flex-row overflow-hidden bg-background text-foreground">
        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger aria-label="Toggle sidebar" />
              <h1 className={pathname.startsWith('/tasks/') ? 'sr-only' : 'truncate text-lg font-semibold'}>{title}</h1>
            </div>
            <ThemeMenu />
          </header>
          <section aria-label={title} className="min-h-0 flex-1 overflow-auto bg-background px-4 py-6 sm:px-8 sm:py-8">
            {error && (
              <div role="alert" className="mx-auto mb-4 flex max-w-4xl items-center justify-between gap-4 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <span>{error}</span>
                <button type="button" className="underline" onClick={clearError}>Dismiss</button>
              </div>
            )}
            {loading ? <p className="mx-auto max-w-4xl py-10 text-sm text-muted-foreground">Loading your projects and tasks…</p> : children}
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
