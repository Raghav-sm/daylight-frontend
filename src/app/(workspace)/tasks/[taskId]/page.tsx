import { Suspense } from 'react';
import { TaskPage } from '@/app/(workspace)/tasks/[taskId]/_components/task-page';

export default function Page({ params }: PageProps<'/tasks/[taskId]'>) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading task…</p>}>
      <TaskContent params={params} />
    </Suspense>
  );
}

async function TaskContent({ params }: Pick<PageProps<'/tasks/[taskId]'>, 'params'>) {
  const { taskId } = await params;
  return <TaskPage taskId={taskId} />;
}
