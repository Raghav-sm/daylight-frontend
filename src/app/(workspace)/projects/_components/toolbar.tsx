'use client';

import { LayoutGrid, List } from 'lucide-react';
import CreateProjectDialogButton from '@/app/(workspace)/projects/_components/create-project-dialog-button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProjectsToolbar() {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <TabsList aria-label="Project views">
        <TabsTrigger value="cards" className="gap-1.5">
          <LayoutGrid aria-hidden="true" className="size-3.5" />
          Cards
        </TabsTrigger>
        <TabsTrigger value="table" className="gap-1.5">
          <List aria-hidden="true" className="size-3.5" />
          Table
        </TabsTrigger>
      </TabsList>
      <CreateProjectDialogButton />
    </div>
  );
}
