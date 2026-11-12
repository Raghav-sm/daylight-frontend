'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TaskDetails } from '@/app/(workspace)/tasks/[taskId]/_components/task-details';
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

export function TaskPage({ taskId }: { taskId: string }) {
  const router = useRouter();
  const { tasks, projects, updateTask, deleteTask } = useWorkspaceData();
  const task = tasks.find((item) => item.id === taskId) ?? null;
  const projectName = task
    ? (projects.find((project) => project.id === task.projectId)?.name ?? 'Project')
    : null;

  if (!task) {
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
                <BreadcrumbPage>Task</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
        title="Task not found"
        subtitle="This task may have been deleted."
      />
    );
  }

  return (
    <PageLayout
      maxWidthClassName="max-w-6xl"
      className="py-1"
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
              <BreadcrumbLink asChild>
                <Link href={`/projects/${encodeURIComponent(task.projectId)}`}>{projectName}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{task.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}
    >
      <TaskDetails
        key={task.id}
        task={task}
        projects={projects}
        onSave={updateTask}
        onDelete={async (id) => {
          if (await deleteTask(id)) {
            router.push(`/projects/${encodeURIComponent(task.projectId)}`);
          }
        }}
      />
    </PageLayout>
  );
}
