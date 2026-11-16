import { BookOpen, BriefcaseBusiness, CalendarDays, Layers3 } from 'lucide-react';
import { SectionFrame } from './section-frame';

const useCases = [
  {
    icon: Layers3,
    title: 'A project at work',
    description: 'Keep launch tasks, owners, and due dates together from first draft to done.',
    example: 'Product launch · 8 tasks',
  },
  {
    icon: CalendarDays,
    title: 'The shape of your week',
    description: 'See what is due soon and move unfinished work into a day that has room.',
    example: 'Plan the week · Review due dates',
  },
  {
    icon: BookOpen,
    title: 'Study with a plan',
    description: 'Break reading or revision into smaller tasks and keep track of what is next.',
    example: 'Coursework · Reading · Review',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Several client projects',
    description: 'Give each client a separate project, then see every task in its own board.',
    example: 'Client A · Client B · Client C',
  },
];

export function UseCasesSection() {
  return (
    <SectionFrame id="use-cases" className="max-w-[1040px] py-16 sm:py-20">
      <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
        <div className="md:sticky md:top-28 md:self-start">
          <p className="text-sm font-medium text-stage-progress">Fits your day</p>
          <h2 className="font-heading mt-3 text-3xl tracking-tight sm:text-4xl">
            One board for the work you are carrying.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Keep different parts of life in separate projects, with the same simple way to plan and make progress.
          </p>
        </div>

        <ul className="divide-y divide-border border-y border-border">
          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <li key={useCase.title} className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-medium sm:text-base">{useCase.title}</h3>
                    <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">{useCase.description}</p>
                  </div>
                </div>
                <p className="pl-7 text-xs text-muted-foreground sm:pl-0 sm:text-right">{useCase.example}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </SectionFrame>
  );
}
