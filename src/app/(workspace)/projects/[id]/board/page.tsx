import { Suspense } from 'react';
import { redirect } from 'next/navigation';

export default function LegacyProjectBoardPage({ params }: PageProps<'/projects/[id]/board'>) {
  return (
    <Suspense fallback={null}>
      <LegacyBoardRedirect params={params} />
    </Suspense>
  );
}

async function LegacyBoardRedirect({ params }: Pick<PageProps<'/projects/[id]/board'>, 'params'>) {
  const { id } = await params;
  redirect(`/projects/${encodeURIComponent(id)}`);
  return null;
}
