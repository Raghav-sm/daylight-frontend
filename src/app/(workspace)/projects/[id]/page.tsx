import { ProjectBoardView } from '@/components/board/project-board-view';

export default async function ProjectPage({ params }: PageProps<'/projects/[id]'>) {
  const { id } = await params;
  return <ProjectBoardView projectId={id} />;
}
