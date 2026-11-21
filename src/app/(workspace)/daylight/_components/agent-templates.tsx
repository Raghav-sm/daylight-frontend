'use client';

import { useState } from 'react';
import { ArrowUpRight, CalendarDays, CheckCheck, Layers3, ListTodo, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Template = {
  title: string;
  description: string;
  category: 'Planning' | 'Tasks' | 'Review';
  icon: LucideIcon;
  color: 'amber' | 'blue' | 'green' | 'violet';
  prompt: string;
};

const templates: Template[] = [
  { title: 'Make a plan for today', description: 'Choose what matters. Find your first step.', category: 'Planning', icon: CalendarDays, color: 'amber', prompt: 'Help me plan today. Ask about my priorities and available time, then suggest a focused task list.' },
  { title: 'Break down an idea', description: 'From a big idea to a few doable tasks.', category: 'Tasks', icon: Layers3, color: 'blue', prompt: 'Help me break down a task into actionable steps. First, ask me what I want to accomplish.' },
  { title: 'Prepare a project launch', description: 'A clear checklist, from now to launch day.', category: 'Planning', icon: ListTodo, color: 'green', prompt: 'Help me prepare a project launch checklist. Ask me about the project, target date, and what still needs to happen.' },
  { title: 'Reflect on the week', description: 'What moved forward. What comes next.', category: 'Review', icon: CheckCheck, color: 'violet', prompt: 'Help me review my week. Ask what I finished, what is blocked, and what I should focus on next.' },
];

export function AgentTemplates({ onSelect }: { onSelect: (prompt: string) => void }) {
  const [category, setCategory] = useState('All');
  const visibleTemplates = category === 'All' ? templates : templates.filter((item) => item.category === category);

  return (
    <section aria-labelledby="agent-templates-title" className="mx-auto mt-7 max-w-5xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="agent-templates-title" className="font-sans text-base font-medium">A place to start</h2>
        </div>
        <div role="group" aria-label="Filter suggestions" className="flex flex-wrap gap-1">
          {['All', 'Planning', 'Tasks', 'Review'].map((item) => (
            <Button key={item} type="button" size="xs" variant={category === item ? 'secondary' : 'ghost'} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</Button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visibleTemplates.map(({ title, description, category: templateCategory, icon: Icon, color, prompt }) => (
          <button key={title} type="button" data-project-color={color} className="daylight-agent-template" onClick={() => onSelect(prompt)}>
            <div className="daylight-agent-template-heading">
              <span className="daylight-agent-template-icon"><Icon aria-hidden="true" className="size-4" /></span>
              <span className="text-[11px] text-muted-foreground">{templateCategory}</span>
              <ArrowUpRight aria-hidden="true" className="daylight-agent-template-arrow ml-auto size-3.5" />
            </div>
            <h3 className="mt-3 font-sans text-sm font-medium">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
