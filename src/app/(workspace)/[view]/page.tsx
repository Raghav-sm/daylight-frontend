import { notFound } from 'next/navigation';
import { TaskWorkspace } from '@/components/task-workspace';
import type { BuiltInView } from '@/lib/task-types';

const routeViews: Record<string, BuiltInView> = {
  inbox: 'Inbox',
  today: 'Today',
  upcoming: 'Upcoming',
  'all-tasks': 'All Tasks',
  completed: 'Completed',
};

export default async function ViewPage({ params }: PageProps<'/[view]'>) {
  const { view: route } = await params;
  const view = routeViews[route];
  if (!view) notFound();

  return <TaskWorkspace view={view} />;
}
