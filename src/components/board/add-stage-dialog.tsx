'use client';

import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { projectColors } from '@/lib/project-colors';
import type { ProjectColor } from '@/lib/task-types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AddStageDialog({ projectName, onCreate }: { projectName: string; onCreate: (name: string, color: ProjectColor) => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState<ProjectColor>('violet');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function closeDialog() {
    setOpen(false);
    setName('');
    setColor('violet');
    setError('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const created = await onCreate(name.trim(), color);
    setSaving(false);
    if (!created) {
      setError('Could not add this stage. Check its name and try again.');
      return;
    }
    closeDialog();
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) closeDialog(); else setOpen(true); }}>
      <DialogTrigger asChild><Button type="button" variant="secondary" size="sm"><Plus aria-hidden="true" />Add stage</Button></DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add stage</DialogTitle>
          <DialogDescription>Add a column to the {projectName} board.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="project-stage-name" className="mb-1.5 block text-sm font-medium">Stage name</label>
            <Input autoFocus id="project-stage-name" placeholder="e.g. Review" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div>
            <label htmlFor="project-stage-color" className="mb-1.5 block text-sm font-medium">Stage color</label>
            <Select value={color} onValueChange={(value: ProjectColor) => setColor(value)}>
              <SelectTrigger id="project-stage-color" aria-label="Stage color"><SelectValue /></SelectTrigger>
              <SelectContent>
                {projectColors.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    <span className="inline-flex items-center gap-2"><span data-project-color={item.value} className="project-color-dot size-3 shrink-0 rounded-full" />{item.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="border-t border-border pt-4">
            <Button type="button" variant="secondary" size="sm" onClick={closeDialog}>Cancel</Button>
            <Button type="submit" size="sm" disabled={!name.trim() || saving}>{saving ? 'Adding…' : 'Add stage'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
