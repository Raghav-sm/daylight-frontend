import { redirect } from 'next/navigation';

export default async function LegacyProjectBoardPage({ params }: PageProps<'/projects/[id]/board'>) {
  const { id } = await params;
  redirect(`/projects/${encodeURIComponent(id)}`);
}
