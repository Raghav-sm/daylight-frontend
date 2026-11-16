import { Suspense } from 'react';
import { ProjectBoardPage } from '@/app/(workspace)/projects/[id]/_components/project-board-page';

export default function Page({ params }: PageProps<'/projects/[id]'>) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading board…</p>}>
      <ProjectBoardContent params={params} />
    </Suspense>
  );
}

async function ProjectBoardContent({ params }: Pick<PageProps<'/projects/[id]'>, 'params'>) {
  const { id } = await params;
  return <ProjectBoardPage projectId={id} />;
}
