import { TaskWorkspace } from '@/components/task-workspace';

export default async function ProjectBoardPage({ params }: PageProps<'/projects/[projectId]/board'>) {
  const { projectId } = await params;
  return <TaskWorkspace projectId={projectId} projectViewMode="board" />;
}
