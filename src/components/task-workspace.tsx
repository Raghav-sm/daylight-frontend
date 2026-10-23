'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TaskDetails } from '@/components/task-details';
import { TaskList } from '@/components/task-list';
import { ThemeMenu } from '@/components/theme-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BuiltInView, ProjectColor, Task } from '@/lib/task-types';
import { useWorkspaceData } from '@/components/workspace-data-provider';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

function getLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function priorityWeight(priority: Task['priority']) {
  return { high: 0, medium: 1, low: 2, none: 3 }[priority];
}

const viewRoutes: Record<BuiltInView, string> = {
  Inbox: '/inbox',
  Today: '/today',
  Upcoming: '/upcoming',
  'All Tasks': '/all-tasks',
  Completed: '/completed',
};

type TaskWorkspaceProps = {
  view?: BuiltInView;
  projectId?: string;
  projectViewMode?: 'list' | 'board';
};

export function TaskWorkspace({ view = 'Inbox', projectId, projectViewMode = 'list' }: TaskWorkspaceProps) {
  const router = useRouter();
  const {
    projects,
    tasks,
    createTask: addTask,
    updateTask,
    setTaskCompletion,
    deleteTask: removeTask,
    createProject: addProject,
    renameProject,
    changeProjectColor,
    addProjectStage,
    moveTaskToStage,
    deleteProject: removeProject,
  } = useWorkspaceData();
  const activeProjectId = projectId ?? null;
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showCompletedProjectTasks, setShowCompletedProjectTasks] = useState(false);
  const today = getLocalDate(new Date());

  const selectedProject = projects.find((project) => project.id === activeProjectId);
  const currentTitle = selectedProject?.name ?? view;
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;

  const visibleTasks = useMemo(() => {
    let result: Task[];

    if (activeProjectId) {
      result = tasks.filter((task) => task.projectId === activeProjectId && (showCompletedProjectTasks || !task.completed));
    } else if (view === 'Inbox') {
      result = tasks.filter((task) => !task.completed && !task.projectId);
    } else if (view === 'Today') {
      result = tasks.filter((task) => !task.completed && task.dueDate !== null && task.dueDate <= today);
    } else if (view === 'Upcoming') {
      result = tasks.filter((task) => !task.completed && task.dueDate !== null && task.dueDate > today);
    } else if (view === 'Completed') {
      result = tasks.filter((task) => task.completed);
    } else {
      result = tasks.filter((task) => !task.completed);
    }

    return [...result].sort((first, second) => {
      if (view === 'Completed' && !activeProjectId) {
        return (second.completedAt ?? '').localeCompare(first.completedAt ?? '');
      }
      const dateOrder = (first.dueDate ?? '9999-12-31').localeCompare(second.dueDate ?? '9999-12-31');
      const timeOrder = (first.dueTime ?? '').localeCompare(second.dueTime ?? '');
      return dateOrder || timeOrder || priorityWeight(first.priority) - priorityWeight(second.priority) || first.createdAt.localeCompare(second.createdAt);
    });
  }, [activeProjectId, showCompletedProjectTasks, tasks, today, view]);

  const taskGroups = useMemo(() => {
    if (view !== 'Today' || activeProjectId) {
      return [{ label: '', tasks: visibleTasks }];
    }

    const overdue = visibleTasks.filter((task) => task.dueDate !== null && task.dueDate < today);
    const dueToday = visibleTasks.filter((task) => task.dueDate === today);
    return [
      { label: 'Overdue', tasks: overdue },
      { label: 'Today', tasks: dueToday },
    ].filter((group) => group.tasks.length > 0);
  }, [activeProjectId, today, view, visibleTasks]);

  function selectView(nextView: BuiltInView) {
    router.push(viewRoutes[nextView]);
    setSelectedTaskId(null);
    setShowCompletedProjectTasks(false);
  }

  function selectProject(projectId: string) {
    router.push(`/projects/${encodeURIComponent(projectId)}`);
    setShowCompletedProjectTasks(false);
    setSelectedTaskId(null);
  }

  function createTask(taskDraft: Parameters<typeof addTask>[0]) {
    addTask(taskDraft);
    setSelectedTaskId(null);
    setDetailsOpen(false);
    setShowCompletedProjectTasks(false);
    if (!taskDraft.projectId) {
      router.push('/inbox');
      return;
    }
    const keepBoardOpen = projectViewMode === 'board' && taskDraft.projectId === activeProjectId;
    router.push(`/projects/${encodeURIComponent(taskDraft.projectId)}${keepBoardOpen ? '/board' : ''}`);
  }

  function deleteTask(taskId: string) {
    removeTask(taskId);
    setSelectedTaskId((currentId) => currentId === taskId ? null : currentId);
    setDetailsOpen(false);
  }

  function createProject(name: string, color: ProjectColor) {
    const project = addProject(name, color);
    router.push(`/projects/${encodeURIComponent(project.id)}`);
    setSelectedTaskId(null);
  }

  function deleteProject(projectId: string) {
    removeProject(projectId);
    if (activeProjectId === projectId) {
      router.push('/inbox');
      setSelectedTaskId(null);
    }
  }

  function changeProjectViewMode(mode: 'list' | 'board') {
    if (!activeProjectId) return;
    router.push(`/projects/${encodeURIComponent(activeProjectId)}${mode === 'board' ? '/board' : ''}`);
  }

  const projectCounts = Object.fromEntries(projects.map((project) => [
    project.id,
    tasks.filter((task) => task.projectId === project.id && !task.completed).length,
  ]));

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar
        activeView={activeProjectId ? null : view}
        activeProjectId={activeProjectId}
        projects={projects}
        projectCounts={projectCounts}
        onViewChange={selectView}
        onProjectSelect={selectProject}
        onProjectCreate={createProject}
      />
      <SidebarInset className="min-h-svh min-w-0 flex-row overflow-hidden bg-background text-foreground">
        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger aria-label="Toggle sidebar" />
              <h1 className="truncate text-lg font-semibold">{currentTitle}</h1>
            </div>
            <div className="flex items-center gap-3">
              {selectedProject && (
                <Tabs value={projectViewMode} onValueChange={(value) => changeProjectViewMode(value === 'board' ? 'board' : 'list')}>
                  <TabsList aria-label="Project view">
                    <TabsTrigger value="list">List</TabsTrigger>
                    <TabsTrigger value="board">Board</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
              <ThemeMenu />
            </div>
          </header>
          <section aria-label={`${currentTitle} tasks`} className="min-h-0 flex-1 overflow-auto bg-background px-4 py-6 sm:px-8 sm:py-8">
            {selectedProject && projectViewMode === 'board' ? (
              <KanbanBoard
                project={selectedProject}
                projects={projects}
                tasks={tasks.filter((task) => task.projectId === selectedProject.id)}
                onTaskSelect={(taskId) => { setSelectedTaskId(taskId); setDetailsOpen(true); }}
                onTaskMove={moveTaskToStage}
                onAddStage={(name, color) => addProjectStage(selectedProject.id, name, color)}
                onTaskCreate={createTask}
              />
            ) : (
              <TaskList
                title={currentTitle}
                projects={projects}
                defaultProjectId={activeProjectId}
                groups={taskGroups}
                completedProjectTaskCount={activeProjectId ? tasks.filter((task) => task.projectId === activeProjectId && task.completed).length : 0}
                showCompletedProjectTasks={showCompletedProjectTasks}
                onToggleCompletedProjectTasks={() => setShowCompletedProjectTasks((show) => !show)}
                selectedTaskId={selectedTaskId}
                onTaskSelect={(taskId) => { setSelectedTaskId(taskId); setDetailsOpen(true); }}
                onTaskCompletionChange={setTaskCompletion}
                onTaskCreate={createTask}
                onProjectRename={renameProject}
                onProjectColorChange={changeProjectColor}
                onProjectDelete={deleteProject}
              />
            )}
          </section>
        </main>
        <TaskDetails
          task={selectedTask}
          projects={projects}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onSave={updateTask}
          onDelete={deleteTask}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
