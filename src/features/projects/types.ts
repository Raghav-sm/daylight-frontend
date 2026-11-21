export type ProjectColor = 'red' | 'orange' | 'amber' | 'green' | 'teal' | 'blue' | 'violet';

export type ProjectStage = {
  id: string;
  name: string;
  color: ProjectColor;
};

export type Project = {
  id: string;
  name: string;
  color: ProjectColor;
  initialStageId: string | null;
  finalStageId: string | null;
  stages: ProjectStage[];
};

export type ProjectSummary = {
  id: string;
  name: string;
  color: ProjectColor;
  taskCount: number;
  incompleteTaskCount: number;
  stageCount: number;
};
