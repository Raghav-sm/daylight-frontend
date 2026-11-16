'use client';

import { useEffect, useRef, useState } from 'react';
import { Circle, CircleCheck, CircleDot, Plus } from 'lucide-react';
import styles from '../features-section.module.css';

const columns = [
  {
    name: 'To Do',
    tone: 'muted',
    icon: Circle,
    cards: [
      'Review landing page',
      'Write launch announcement',
    ],
  },
  {
    name: 'In Progress',
    tone: 'orange',
    icon: CircleDot,
    cards: ['Prepare launch checklist'],
  },
  {
    name: 'Completed',
    tone: 'violet',
    icon: CircleCheck,
    cards: ['Define project scope'],
  },
];

export function BoardPreview() {
  const root = useRef<HTMLDivElement>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const timer = window.setTimeout(() => setAdded(true), 0);
      return () => window.clearTimeout(timer);
    }
    const node = root.current;
    if (!node) return;
    const timers: number[] = [];
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        timers.push(window.setTimeout(() => setAdded(true), 1400));
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(node);
    return () => { observer.disconnect(); timers.forEach((timer) => window.clearTimeout(timer)); };
  }, []);

  return (
    <div ref={root} className="min-h-[23rem] sm:min-h-[17rem]">
      <div className="grid grid-cols-3 items-start gap-3">
        {columns.map((column) => {
          const Icon = column.icon;
          return (
            <div key={column.name} className="flex flex-col gap-4">
              <section
                data-kanban-tone={column.tone}
                className="kanban-column flex flex-col gap-2 rounded-2xl border p-2"
              >
                <div className="kanban-column-title flex items-center gap-1.5 px-1.5 py-1">
                  <Icon aria-hidden="true" className="size-3.5 shrink-0" />
                  <h3 className="min-w-0 flex-1 truncate text-sm font-medium">{column.name}</h3>
                  <span className="kanban-count rounded-full border px-1.5 text-[11px] tabular-nums">
                    {String(column.cards.length + (column.name === 'To Do' && added ? 1 : 0)).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {column.cards.map((title) => (
                    <div key={title} className="rounded-xl bg-card px-3 py-3 text-sm leading-snug shadow-xs">
                      {title}
                    </div>
                  ))}
                  {column.name === 'To Do' && (
                    <div data-added={added} className={styles.newTask}>
                      <div className="min-h-0 overflow-hidden">
                        <div className="rounded-xl bg-card px-3 py-3 text-sm leading-snug shadow-xs">Draft the launch email</div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground">
                  <Plus aria-hidden="true" className="size-3.5" />
                  Add task
                </p>
              </section>
            </div>
          );
        })}
      </div>
    </div>
  );
}
