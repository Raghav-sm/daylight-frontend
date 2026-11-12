'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ProjectCards } from '@/app/(workspace)/projects/_components/project-cards';
import { ProjectEmptyState } from '@/app/(workspace)/projects/_components/project-empty-state';
import { ProjectNameCell } from '@/app/(workspace)/projects/_components/project-name-cell';
import { ProjectRowActions } from '@/app/(workspace)/projects/_components/project-row-actions';
import { projectTaskCount } from '@/app/(workspace)/projects/_components/project-utils';
import ProjectsToolbar from '@/app/(workspace)/projects/_components/toolbar';
import { PageLayout } from '@/components/layout/page-layout';
import { useWorkspaceData } from '@/providers/workspace-data-provider';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { Project } from '@/lib/task-types';

export default function ProjectsPage() {
  const { projects, tasks } = useWorkspaceData();
  const [view, setView] = useState<'cards' | 'table'>('cards');

  const columns = useMemo<DataTableColumn<Project>[]>(
    () => [
      {
        label: 'Project',
        fieldName: 'name',
        formatter: (_value, row) => <ProjectNameCell project={row} />,
      },
      {
        label: 'Tasks',
        fieldName: 'id',
        className: 'text-muted-foreground',
        formatter: (projectId) => projectTaskCount(tasks, projectId as string),
      },
      {
        label: 'Stages',
        fieldName: 'stages',
        className: 'text-muted-foreground',
        formatter: (stages) => (stages as Project['stages']).length,
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
    [tasks],
  );

  return (
    <PageLayout
      breadcrumbs={(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Projects</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}
      title="Projects"
      subtitle="Your boards and their tasks."
    >
      {projects.length === 0 ? (
        <ProjectEmptyState />
      ) : (
        <Tabs value={view} onValueChange={(value) => setView(value === 'table' ? 'table' : 'cards')}>
          <ProjectsToolbar showCreate showViewToggle />
          <TabsContent value="cards">
            <ProjectCards projects={projects} tasks={tasks} />
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
