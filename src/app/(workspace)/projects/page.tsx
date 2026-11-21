'use client';

import { ProjectCards } from '@/app/(workspace)/projects/_components/project-cards';
import { ProjectNameCell } from '@/app/(workspace)/projects/_components/project-name-cell';
import { ProjectRowActions } from '@/app/(workspace)/projects/_components/project-row-actions';
import ProjectsToolbar from '@/app/(workspace)/projects/_components/toolbar';
import { PageLayout } from '@/components/layout/page-layout';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useProjects } from '@/features/projects/data';
import type { ProjectSummary } from '@/features/projects/types';

const PROJECT_COLUMNS: DataTableColumn<ProjectSummary>[] = [
  {
    label: 'Project',
    fieldName: 'name',
    formatter: (_value, row) => <ProjectNameCell project={row} />,
  },
  {
    label: 'Tasks',
    fieldName: 'taskCount',
    className: 'text-muted-foreground',
    formatter: (_value, row) => row.taskCount,
  },
  {
    label: 'Stages',
    fieldName: 'stageCount',
    className: 'text-muted-foreground',
    formatter: (stageCount) => stageCount as number,
  },
  {
    label: 'Actions',
    fieldName: '__actions__',
    type: 'ACTIONS',
    formatter: (_value, row) => <ProjectRowActions project={row} />,
  },
];

export default function ProjectsPage() {
  const allProjects = useProjects();

  return (
    <>
      <PageLayout
        maxWidthClassName="max-w-6xl"
        title="Projects"
        subtitle="Your boards and their tasks."
      />

      <div className="mx-auto w-full max-w-6xl">
        <Tabs defaultValue="cards">
          <ProjectsToolbar />
          <TabsContent value="cards">
            <ProjectCards
              projects={allProjects.data}
              isLoading={allProjects.isLoading}
              error={allProjects.error}
              onRetry={() => void allProjects.refetch()}
              emptyMessage="No projects yet."
            />
          </TabsContent>
          <TabsContent value="table">
            <DataTable
              surface="transparent"
              columns={PROJECT_COLUMNS}
              data={allProjects.data}
              isLoading={allProjects.isLoading}
              error={allProjects.error}
              onRetry={() => void allProjects.refetch()}
              getRowId={(project) => project.id}
              getRowHref={(project) => `/projects/${encodeURIComponent(project.id)}`}
              emptyMessage="No projects yet."
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
