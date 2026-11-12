import { Suspense } from 'react';
import { TaskPage } from '@/app/(workspace)/tasks/[taskId]/_components/task-page';

export default async function Page({ params }: PageProps<'/tasks/[taskId]'>) {
  const { taskId } = await params;

  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading task…</p>}>
      <TaskPage taskId={taskId} />
    </Suspense>
  );
}
