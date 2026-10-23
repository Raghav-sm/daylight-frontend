'use client';

import { useState, type FormEvent } from 'react';
import {
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  FolderKanban,
  Inbox,
  ListTodo,
  Plus,
  Sun,
} from 'lucide-react';
import type { BuiltInView, Project, ProjectColor } from '@/lib/task-types';
import { projectColors } from '@/lib/project-colors';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const views: { name: BuiltInView; icon: typeof Inbox }[] = [
  { name: 'Inbox', icon: Inbox },
  { name: 'Today', icon: CalendarDays },
  { name: 'Upcoming', icon: CalendarRange },
  { name: 'All Tasks', icon: ListTodo },
  { name: 'Completed', icon: CheckCircle2 },
];

type AppSidebarProps = {
  activeView: BuiltInView | null;
  activeProjectId: string | null;
  projects: Project[];
  projectCounts: Record<string, number>;
  onViewChange: (view: BuiltInView) => void;
  onProjectSelect: (projectId: string) => void;
  onProjectCreate: (name: string, color: ProjectColor) => void;
};

export function AppSidebar({
  activeView,
  activeProjectId,
  projects,
  projectCounts,
  onViewChange,
  onProjectSelect,
  onProjectCreate,
}: AppSidebarProps) {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState<ProjectColor>('blue');
  const [error, setError] = useState('');

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newProjectName.trim();
    if (!name) return;
    if (projects.some((project) => project.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setError('A project with that name already exists.');
      return;
    }
    onProjectCreate(name, newProjectColor);
    setNewProjectName('');
    setNewProjectColor('blue');
    setCreateProjectOpen(false);
    setError('');
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-sidebar-border/60">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Daylight" className="cursor-default">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Sun aria-hidden="true" className="size-4" />
              </span>
              <span className="truncate text-base font-semibold tracking-tight">Daylight</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Views</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {views.map(({ name, icon: Icon }) => (
                <SidebarMenuItem key={name}>
                  <SidebarMenuButton isActive={activeView === name} tooltip={name} onClick={() => onViewChange(name)}>
                    <Icon aria-hidden="true" />
                    <span>{name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel className="px-0">Projects</SidebarGroupLabel>
            <Dialog open={createProjectOpen} onOpenChange={(open) => {
              setCreateProjectOpen(open);
              if (!open) {
                setNewProjectName('');
                setNewProjectColor('blue');
                setError('');
              }
            }}>
              <DialogTrigger asChild>
                <Button type="button" variant="ghost" size="icon-xs" aria-label="Create project" title="Create project" className="group-data-[collapsible=icon]:hidden" onClick={() => setError('')}>
                  <Plus aria-hidden="true" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create project</DialogTitle>
                  <DialogDescription>Projects keep related tasks together and each one gets its own Kanban stages.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submitProject} className="space-y-4">
                  <div>
                    <label htmlFor="new-project-name" className="mb-1.5 block text-sm font-medium">Project name</label>
                    <Input id="new-project-name" autoFocus placeholder="e.g. Home" value={newProjectName} onChange={(event) => setNewProjectName(event.target.value)} required />
                  </div>
                  <div>
                    <label htmlFor="new-project-color" className="mb-1.5 block text-sm font-medium">Project color</label>
                    <Select value={newProjectColor} onValueChange={(value: ProjectColor) => setNewProjectColor(value)}>
                      <SelectTrigger id="new-project-color" aria-label="Project color"><SelectValue /></SelectTrigger>
                      <SelectContent>{projectColors.map((color) => <SelectItem key={color.value} value={color.value}><span className="inline-flex items-center gap-2"><span data-project-color={color.value} className="project-color-dot size-2.5 rounded-full" />{color.name}</span></SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateProjectOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={!newProjectName.trim()}>Create project</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <SidebarGroupContent>
            {error && <p role="alert" className="mb-2 px-2 text-xs text-destructive group-data-[collapsible=icon]:hidden">{error}</p>}
            {projects.length === 0 ? (
              <p className="px-2 text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">Your projects will appear here.</p>
            ) : (
              <SidebarMenu>
                {projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      isActive={activeProjectId === project.id}
                      tooltip={project.name}
                      onClick={() => onProjectSelect(project.id)}
                    >
                      <span data-project-color={project.color} className="project-color-dot size-2.5 shrink-0 rounded-full" aria-hidden="true" />
                      <span className="truncate">{project.name}</span>
                      <span className="ml-auto text-xs text-sidebar-foreground/60">{projectCounts[project.id] ?? 0}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
          <FolderKanban aria-hidden="true" className="size-3.5" />
          <span>A clear space for your tasks.</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
