import { Suspense } from 'react';
import { ProjectBoardPage } from '@/app/(workspace)/projects/[id]/_components/project-board-page';

export default async function Page({ params }: PageProps<'/projects/[id]'>) {
  const { id } = await params;

  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading board…</p>}>
      <ProjectBoardPage projectId={id} />
    </Suspense>
  );
}
