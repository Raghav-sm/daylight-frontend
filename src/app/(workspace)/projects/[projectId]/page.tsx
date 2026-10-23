import { TaskWorkspace } from '@/components/task-workspace';

export default async function ProjectPage({ params }: PageProps<'/projects/[projectId]'>) {
  const { projectId } = await params;
  return <TaskWorkspace projectId={projectId} projectViewMode="list" />;
}
