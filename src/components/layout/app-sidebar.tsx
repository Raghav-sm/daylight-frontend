'use client';

import Link from 'next/link';
import { FolderKanban, LayoutDashboard, Plus } from 'lucide-react';
import type { Project, ProjectColor } from '@/lib/task-types';
import { ProjectCreateDialog } from '@/components/projects/project-create-dialog';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

type AppSidebarProps = {
  activePath: string;
  activeProjectId: string | null;
  projects: Project[];
  projectCounts: Record<string, number>;
  onProjectCreate: (name: string, color: ProjectColor) => Promise<Project | null>;
};

export function AppSidebar({ activePath, activeProjectId, projects, projectCounts, onProjectCreate }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="h-16 justify-center px-4">
        <span className="truncate text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">Daylight</span>
        <span aria-hidden="true" className="hidden text-base font-semibold group-data-[collapsible=icon]:block">D</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <ProjectCreateDialog
            projects={projects}
            onCreate={onProjectCreate}
            trigger={<SidebarGroupAction title="Create project"><Plus aria-hidden="true" /></SidebarGroupAction>}
          />
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={activePath === '/dashboard'} tooltip="Dashboard">
                  <Link href="/dashboard"><LayoutDashboard aria-hidden="true" /><span>Dashboard</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={activePath === '/projects'} tooltip="Projects">
                  <Link href="/projects"><FolderKanban aria-hidden="true" /><span>Projects</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeProjectId === project.id}
                    tooltip={project.name}
                  >
                    <Link href={`/projects/${encodeURIComponent(project.id)}`}>
                      <span data-project-color={project.color} className="project-color-dot size-2.5 shrink-0 rounded-full" />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{projectCounts[project.id] ?? 0}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            {projects.length === 0 && <p className="px-2 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">Create a project to get started.</p>}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
