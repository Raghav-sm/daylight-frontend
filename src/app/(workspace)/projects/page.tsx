'use client';

import { useMemo, useState } from 'react';
import { ProjectCards } from '@/app/(workspace)/projects/_components/project-cards';
import { ProjectEmptyState } from '@/app/(workspace)/projects/_components/project-empty-state';
import { ProjectNameCell } from '@/app/(workspace)/projects/_components/project-name-cell';
import { ProjectRowActions } from '@/app/(workspace)/projects/_components/project-row-actions';
import ProjectsToolbar from '@/app/(workspace)/projects/_components/toolbar';
import { PageLayout } from '@/components/layout/page-layout';
import { useProjectSummaries } from '@/features/projects/data';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import type { ProjectSummary } from '@/features/projects/types';

export default function ProjectsPage() {
  const { data: projects = [], isLoading, error, refetch } = useProjectSummaries();
  const [view, setView] = useState<'cards' | 'table'>('cards');

  const columns = useMemo<DataTableColumn<ProjectSummary>[]>(
    () => [
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
        headerClassName: 'text-right',
        className: 'text-right',
        formatter: (_value, row) => <ProjectRowActions project={row} />,
      },
    ],
    [],
  );

  return (
    <PageLayout
      maxWidthClassName="max-w-6xl"
      title="Projects"
      subtitle="Your boards and their tasks."
    >
      {error && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Could not load projects.'}{' '}
          <button type="button" className="underline" onClick={() => void refetch()}>
            Retry
          </button>
        </p>
      )}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading projects…</p>
      ) : projects.length === 0 ? (
        <ProjectEmptyState />
      ) : (
        <Tabs value={view} onValueChange={(value) => setView(value === 'table' ? 'table' : 'cards')}>
          <ProjectsToolbar showCreate showViewToggle />
          <TabsContent value="cards">
            <ProjectCards projects={projects} />
          </TabsContent>
          <TabsContent value="table">
            <DataTable
              columns={columns}
              data={projects}
              getRowId={(project) => project.id}
              getRowHref={(project) => `/projects/${encodeURIComponent(project.id)}`}
              emptyMessage="No projects yet."
            />
          </TabsContent>
        </Tabs>
      )}
    </PageLayout>
  );
}
