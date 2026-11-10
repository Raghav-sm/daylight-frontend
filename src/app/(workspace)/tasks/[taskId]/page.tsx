import { TaskDetailsView } from '@/components/tasks/task-details-view';

export default async function TaskPage({ params }: PageProps<'/tasks/[taskId]'>) {
  const { taskId } = await params;
  return <TaskDetailsView taskId={taskId} />;
}
