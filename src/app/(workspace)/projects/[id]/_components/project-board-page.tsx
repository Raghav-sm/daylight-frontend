'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Board } from '@/app/(workspace)/projects/[id]/_components/board';
import BoardToolbar from '@/app/(workspace)/projects/[id]/_components/toolbar';
import { PageLayout } from '@/components/layout/page-layout';
import { useWorkspaceData } from '@/providers/workspace-data-provider';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export function ProjectBoardPage({ projectId }: { projectId: string }) {
  const router = useRouter();
  const {
    projects,
    tasks,
    createTask,
    updateProject,
    deleteProject,
    addProjectStage,
    moveTaskToStage,
  } = useWorkspaceData();

  const project = projects.find((item) => item.id === projectId);

  if (!project) {
    return (
      <PageLayout
        maxWidthClassName="max-w-6xl"
        breadcrumbs={(
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/projects">Projects</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Project</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
        title="Project not found"
        subtitle="This project may have been deleted."
      >
        <p className="text-sm text-muted-foreground">Choose another project from the list.</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      maxWidthClassName="max-w-6xl"
      breadcrumbs={(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/projects">Projects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}
      title={`${project.name} board`}
      subtitle="Move tasks between stages by dragging them."
      headerActions={(
        <BoardToolbar
          project={project}
          projects={projects}
          onAddStage={(name, color) => addProjectStage(project.id, name, color)}
          onProjectSave={updateProject}
          onProjectDelete={async (id) => {
            const deleted = await deleteProject(id);
            if (deleted) router.push('/projects');
            return deleted;
          }}
        />
      )}
    >
      <div className="border-t border-border/70 pt-4">
        <Board
          project={project}
          projects={projects}
          tasks={tasks.filter((task) => task.projectId === project.id)}
          onTaskSelect={(taskId) => router.push(`/tasks/${encodeURIComponent(taskId)}`)}
          onTaskMove={moveTaskToStage}
          onTaskCreate={createTask}
        />
      </div>
    </PageLayout>
  );
}
