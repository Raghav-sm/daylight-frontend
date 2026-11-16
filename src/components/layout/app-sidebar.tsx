'use client';

import Link from 'next/link';
import { FolderKanban, LayoutDashboard, Monitor, Moon, Plus, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import type { ProjectColor, ProjectSummary } from '@/features/projects/types';
import { ProjectCreateDialog } from '@/components/projects/project-create-dialog';
import { LogoMark } from '@/components/layout/logo-mark';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

type AppSidebarProps = {
  activePath: string;
  activeProjectId: string | null;
  projects: ProjectSummary[];
  projectCounts: Record<string, number>;
  onProjectCreate: (name: string, color: ProjectColor) => Promise<{ id: string } | null>;
  statusMessage?: { text: string; onRetry: () => void };
  preview?: boolean;
};

const subscribe = () => () => {};

function ThemeFooter() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const label = !mounted
    ? 'Theme'
    : theme === 'light'
      ? 'Light'
      : theme === 'dark'
        ? 'Dark'
        : 'System';
  const Icon = !mounted
    ? Monitor
    : theme === 'light'
      ? Sun
      : theme === 'dark'
        ? Moon
        : Monitor;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="aria-expanded:bg-sidebar-accent aria-expanded:text-sidebar-accent-foreground"
              tooltip="Theme"
            >
              <Icon aria-hidden="true" />
              <span className="truncate">Theme</span>
              <span className="ml-auto text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
                {label}
              </span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="min-w-40">
            <DropdownMenuItem onSelect={() => setTheme('light')}>
              <Sun aria-hidden="true" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTheme('dark')}>
              <Moon aria-hidden="true" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTheme('system')}>
              <Monitor aria-hidden="true" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebar({
  activePath,
  activeProjectId,
  projects,
  projectCounts,
  onProjectCreate,
  statusMessage,
  preview = false,
}: AppSidebarProps) {
  return (
    <Sidebar
      collapsible={preview ? 'none' : 'icon'}
      variant={preview ? 'sidebar' : 'inset'}
      className={preview ? 'hidden shrink-0 border-r border-sidebar-border md:flex' : undefined}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Daylight">
              <Link href="/dashboard">
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
                >
                  <LogoMark size={16} />
                </span>
                <span className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-medium">Daylight</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">Workspace</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent role="navigation" aria-label="Workspace">
        {statusMessage && (
          <p role="alert" className="mx-2 mb-2 text-xs text-destructive group-data-[collapsible=icon]:hidden">
            {statusMessage.text}{' '}
            <button type="button" className="underline" onClick={statusMessage.onRetry}>
              Retry
            </button>
          </p>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={activePath === '/dashboard'} tooltip="Dashboard">
                  <Link href="/dashboard">
                    <LayoutDashboard aria-hidden="true" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={activePath === '/projects'} tooltip="Projects">
                  <Link href="/projects">
                    <FolderKanban aria-hidden="true" />
                    <span>All projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <ProjectCreateDialog
            projects={projects}
            onCreate={onProjectCreate}
            trigger={(
              <SidebarGroupAction title="Create project">
                <Plus aria-hidden="true" />
                <span className="sr-only">Create project</span>
              </SidebarGroupAction>
            )}
          />
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeProjectId === project.id}
                    tooltip={project.name}
                  >
                    <Link href={`/projects/${encodeURIComponent(project.id)}`}>
                      <span
                        data-project-color={project.color}
                        className="project-color-dot size-2.5 shrink-0 rounded-full"
                      />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{projectCounts[project.id] ?? 0}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            {projects.length === 0 && (
              <p className="px-2 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                Create a project to get started.
              </p>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator className="mx-0" />
        <ThemeFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
