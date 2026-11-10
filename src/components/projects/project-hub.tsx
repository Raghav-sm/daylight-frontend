'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ChevronRight, FolderKanban, LayoutGrid, List, MoreHorizontal, Plus } from 'lucide-react';
import { ProjectCreateDialog } from '@/components/projects/project-create-dialog';
import { ProjectSettingsDialog } from '@/components/projects/project-settings-dialog';
import { useWorkspaceData } from '@/providers/workspace-data-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import type { Project, ProjectColor, Task } from '@/lib/task-types';

function projectTaskCount(tasks: Task[], projectId: string) {
  return tasks.filter((task) => task.projectId === projectId).length;
}

function ProjectCards({ projects, tasks }: { projects: Project[]; tasks: Task[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {projects.map((project) => {
        const taskCount = projectTaskCount(tasks, project.id);
        return (
          <Link
            key={project.id}
            href={`/projects/${encodeURIComponent(project.id)}`}
            className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Card data-project-color={project.color} className="gap-3 rounded-lg px-5 py-4 shadow-none transition-colors group-hover:border-foreground/25 group-hover:bg-muted/20">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span aria-hidden="true" className="project-color-dot size-2.5 shrink-0 rounded-full" />
                  <h3 className="truncate text-base font-medium">{project.name}</h3>
                </div>
                <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                {taskCount} {taskCount === 1 ? 'task' : 'tasks'} <span aria-hidden="true">·</span> {project.stages.length}{' '}
                {project.stages.length === 1 ? 'stage' : 'stages'}
              </p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

function ProjectTable({
  projects,
  tasks,
  onOpen,
  onEdit,
}: {
  projects: Project[];
  tasks: Task[];
  onOpen: (projectId: string) => void;
  onEdit: (project: Project) => void;
}) {
  const columns = useMemo<DataTableColumn<Project>[]>(
    () => [
      {
        id: 'name',
        header: 'Project',
        cell: (project) => (
          <button
            type="button"
            onClick={() => onOpen(project.id)}
            className="flex max-w-full items-center gap-2.5 text-left font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span data-project-color={project.color} aria-hidden="true" className="project-color-dot size-2.5 shrink-0 rounded-full" />
            <span className="truncate">{project.name}</span>
          </button>
        ),
      },
      {
        id: 'tasks',
        header: 'Tasks',
        className: 'text-muted-foreground',
        cell: (project) => projectTaskCount(tasks, project.id),
      },
      {
        id: 'stages',
        header: 'Stages',
        className: 'text-muted-foreground',
        cell: (project) => project.stages.length,
      },
      {
        id: 'actions',
        header: 'Actions',
        headerClassName: 'text-right',
        className: 'text-right',
        cell: (project) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${project.name}`}>
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onOpen(project.id)}>Open</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onEdit(project)}>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                onSelect={() => onEdit(project)}
              >
                Delete…
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onEdit, onOpen, tasks],
  );

  return (
    <DataTable
      columns={columns}
      data={projects}
      getRowId={(project) => project.id}
      emptyMessage="No projects yet."
    />
  );
}

export function ProjectHub() {
  const router = useRouter();
  const { projects, tasks, createProject, updateProject, deleteProject } = useWorkspaceData();
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [settingsProject, setSettingsProject] = useState<Project | null>(null);

  async function addProject(name: string, color: ProjectColor) {
    const project = await createProject(name, color);
    if (project) router.push(`/projects/${encodeURIComponent(project.id)}`);
    return project;
  }

  function openProject(projectId: string) {
    router.push(`/projects/${encodeURIComponent(projectId)}`);
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/dashboard">Dashboard</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Projects</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your boards and their tasks.</p>
        </div>
        {projects.length > 0 && (
          <ProjectCreateDialog
            projects={projects}
            onCreate={addProject}
            trigger={(
              <Button type="button" size="sm"><Plus aria-hidden="true" />Create project</Button>
            )}
          />
        )}
      </div>

      {projects.length === 0 ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-12 text-center">
          <span className="mb-4 flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <FolderKanban aria-hidden="true" className="size-6" />
          </span>
          <h3 className="text-base font-semibold">Start with a project</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Create a project to get a Kanban board. Tasks are added to a stage inside that board.
          </p>
          <ProjectCreateDialog
            projects={projects}
            onCreate={addProject}
            trigger={(
              <Button type="button" size="sm" className="mt-5"><Plus aria-hidden="true" />Create your first project</Button>
            )}
          />
        </div>
      ) : (
        <Tabs value={view} onValueChange={(value) => setView(value === 'table' ? 'table' : 'cards')}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <TabsList aria-label="Project views">
              <TabsTrigger value="cards" className="gap-1.5">
                <LayoutGrid aria-hidden="true" className="size-3.5" />
                Cards
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-1.5">
                <List aria-hidden="true" className="size-3.5" />
                Table
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="cards">
            <ProjectCards projects={projects} tasks={tasks} />
          </TabsContent>

          <TabsContent value="table">
            <ProjectTable
              projects={projects}
              tasks={tasks}
              onOpen={openProject}
              onEdit={setSettingsProject}
            />
          </TabsContent>
        </Tabs>
      )}

      {settingsProject && (
        <ProjectSettingsDialog
          key={settingsProject.id}
          project={settingsProject}
          projects={projects}
          defaultOpen
          hideTrigger
          onOpenChange={(open) => {
            if (!open) setSettingsProject(null);
          }}
          onSave={updateProject}
          onDelete={deleteProject}
        />
      )}
    </div>
  );
}
