'use client';

import { useRouter } from 'next/navigation';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { useWorkspaceData } from '@/providers/workspace-data-provider';

export function ProjectBoardView({ projectId }: { projectId: string }) {
  const router = useRouter();
  const {
    projects, tasks, createTask, updateProject, deleteProject,
    addProjectStage, moveTaskToStage,
  } = useWorkspaceData();
  const project = projects.find((item) => item.id === projectId);

  if (!project) return <p className="text-sm text-muted-foreground">Project not found.</p>;

  return (
    <KanbanBoard
      project={project}
      projects={projects}
      tasks={tasks.filter((task) => task.projectId === projectId)}
      onTaskSelect={(taskId) => router.push(`/tasks/${encodeURIComponent(taskId)}`)}
      onTaskMove={moveTaskToStage}
      onAddStage={(name, color) => addProjectStage(projectId, name, color)}
      onTaskCreate={createTask}
      onProjectSave={updateProject}
      onProjectDelete={async (id) => {
        const deleted = await deleteProject(id);
        if (deleted) router.push('/projects');
        return deleted;
      }}
    />
  );
}
