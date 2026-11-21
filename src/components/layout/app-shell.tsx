'use client';

import Link from 'next/link';
import { Suspense, type ReactNode } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useCreateProject, useProject, useProjects } from '@/features/projects/data';
import { useCurrentUser, useLogout } from '@/features/auth/data';
import { useTask } from '@/features/tasks/data';
import { TaskHeaderMenu } from '@/app/(workspace)/tasks/[taskId]/_components/task-header-menu';
import type { ProjectColor } from '@/features/projects/types';

function AppShellSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { id, taskId } = useParams<{ id?: string; taskId?: string }>();
  const { data: summaries = [], isLoading, error, refetch } = useProjects();
  const { data: task } = useTask(taskId);
  const createProject = useCreateProject();
  const currentUser = useCurrentUser();
  const logout = useLogout();

  const activeProjectId = id ?? task?.projectId ?? null;

  async function handleProjectCreate(name: string, color: ProjectColor) {
    try {
      const project = await createProject.mutateAsync({ name, color });
      router.push(`/projects/${encodeURIComponent(project.id)}`);
      return project;
    } catch {
      return null;
    }
  }

  async function handleLogout() {
    try {
      await logout.mutateAsync();
      router.replace('/login');
    } catch {
      // Keep the current session visible if the server could not revoke it.
    }
  }

  const projectCounts = Object.fromEntries(
    summaries.map((project) => [project.id, project.incompleteTaskCount]),
  );

  const statusMessage = error
    ? {
      text: error instanceof Error ? error.message : 'Could not load projects.',
      onRetry: () => void refetch(),
    }
    : undefined;

  if (isLoading) {
    return <SidebarFallback />;
  }

  return (
    <AppSidebar
      activePath={pathname}
      activeProjectId={activeProjectId}
      projects={summaries}
      projectCounts={projectCounts}
      userName={currentUser.data?.user.name ?? 'User'}
      userEmail={currentUser.data?.user.email ?? ''}
      onLogout={() => void handleLogout()}
      logoutPending={logout.isPending}
      logoutError={logout.isError ? 'Sign out failed. Try again.' : undefined}
      onProjectCreate={handleProjectCreate}
      statusMessage={statusMessage}
    />
  );
}

function AppShellBreadcrumbs() {
  const pathname = usePathname();
  const { id, taskId } = useParams<{ id?: string; taskId?: string }>();
  const { data: task } = useTask(taskId);
  const projectId = id ?? task?.projectId;
  const { data: project } = useProject(projectId);

  if (pathname === '/dashboard') {
    return (
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  if (pathname === '/account') {
    return (
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem className="hidden sm:inline-flex">
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>Account</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  if (pathname === '/projects') {
    return (
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem className="hidden sm:inline-flex">
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>Projects</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  if (pathname.startsWith('/projects/') && id) {
    return (
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem className="hidden sm:inline-flex">
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem className="hidden sm:inline-flex">
            <BreadcrumbLink asChild>
              <Link href="/projects">Projects</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate">{project?.name ?? 'Project'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  if (pathname.startsWith('/tasks/') && taskId) {
    return (
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem className="hidden md:inline-flex">
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden sm:inline-flex">
              <BreadcrumbLink asChild>
                <Link href="/projects">Projects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:block" />
            <BreadcrumbItem className="min-w-0 max-w-[10rem] sm:max-w-[14rem]">
              {task?.projectId ? (
                <BreadcrumbLink asChild>
                  <Link href={`/projects/${encodeURIComponent(task.projectId)}`} className="truncate">
                    {project?.name ?? 'Project'}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="truncate">{project?.name ?? 'Project'}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{task?.title ?? 'Task'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <TaskHeaderMenu task={task} />
      </div>
    );
  }

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem>
          <BreadcrumbPage>Daylight</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function SidebarFallback() {
  return (
    <AppSidebar
      activePath="/projects"
      activeProjectId={null}
      projects={[]}
      projectCounts={{}}
      onProjectCreate={async () => null}
    />
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Suspense fallback={<SidebarFallback />}>
        <AppShellSidebar />
      </Suspense>
      <SidebarInset className="min-h-svh min-w-0 overflow-hidden">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" aria-label="Toggle sidebar" />
          <Suspense
            fallback={(
              <Breadcrumb className="min-w-0">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Daylight</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            )}
          >
            <AppShellBreadcrumbs />
          </Suspense>
        </header>
        <section
          aria-label="Workspace"
          className="min-h-0 flex-1 overflow-auto bg-background px-4 py-4 sm:px-6 sm:py-5"
        >
          {children}
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
