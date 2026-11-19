'use client';

import Link from 'next/link';
import { FolderKanban, LayoutDashboard, LogOut, Monitor, Moon, Plus, Sun, UserRound } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { ProjectColor, ProjectSummary } from '@/features/projects/types';
import { ProjectCreateDialog } from '@/components/projects/project-create-dialog';
import { LogoMark } from '@/components/layout/logo-mark';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  logoutPending?: boolean;
  logoutError?: string;
  onProjectCreate: (name: string, color: ProjectColor) => Promise<{ id: string } | null>;
  statusMessage?: { text: string; onRetry: () => void };
  preview?: boolean;
};

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return initials || <UserRound aria-hidden="true" />;
}

export function AppSidebar({
  activePath,
  activeProjectId,
  projects,
  projectCounts,
  userName = 'User',
  userEmail = '',
  onLogout = () => {},
  logoutPending = false,
  logoutError,
  onProjectCreate,
  statusMessage,
  preview = false,
}: AppSidebarProps) {
  const { theme, setTheme } = useTheme();

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
                  className="flex size-8 shrink-0 items-center justify-center"
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
        {!preview && userEmail && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    className="aria-expanded:bg-sidebar-accent aria-expanded:text-sidebar-accent-foreground"
                    tooltip={userName}
                  >
                    <Avatar size="sm">
                      <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate group-data-[collapsible=icon]:hidden">{userName}</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="truncate font-medium">{userName}</span>
                    <span className="truncate text-xs font-normal text-muted-foreground">{userEmail}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <UserRound aria-hidden="true" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Sun aria-hidden="true" />
                      Appearance
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup
                        value={theme === 'light' || theme === 'dark' ? theme : 'system'}
                        onValueChange={(value) => setTheme(value)}
                      >
                        <DropdownMenuRadioItem value="light">
                          <Sun aria-hidden="true" />
                          Light
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="dark">
                          <Moon aria-hidden="true" />
                          Dark
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="system">
                          <Monitor aria-hidden="true" />
                          System
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={onLogout} disabled={logoutPending}>
                    <LogOut aria-hidden="true" />
                    {logoutPending ? 'Signing out…' : 'Sign out'}
                  </DropdownMenuItem>
                  {logoutError && <p role="alert" className="px-2 py-1 text-xs text-destructive">{logoutError}</p>}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <SidebarSeparator className="mx-0" />
      </SidebarFooter>
    </Sidebar>
  );
}
