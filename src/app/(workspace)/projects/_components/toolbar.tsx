'use client';

import { LayoutGrid, List } from 'lucide-react';
import CreateProjectDialogButton from '@/app/(workspace)/projects/_components/create-project-dialog-button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

type ProjectsToolbarProps = {
  showCreate: boolean;
  showViewToggle: boolean;
};

export default function ProjectsToolbar({ showCreate, showViewToggle }: ProjectsToolbarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      {showViewToggle ? (
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
      ) : (
        <span />
      )}
      {showCreate && <CreateProjectDialogButton />}
    </div>
  );
}
