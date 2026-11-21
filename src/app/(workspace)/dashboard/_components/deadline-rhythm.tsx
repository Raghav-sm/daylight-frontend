import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TaskSummary } from '@/features/tasks/types';

function dateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function DeadlineRhythm({ tasks }: { tasks: TaskSummary[] }) {
  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    const count = tasks.filter((task) => task.dueDate === dateKey(date)).length;
    return { key: dateKey(date), day: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date), date: date.getDate(), count };
  });
  const maximum = Math.max(1, ...days.map((day) => day.count));
  const total = days.reduce((sum, day) => sum + day.count, 0);

  return (
    <Card className="gap-0 border border-border py-0 shadow-[0_12px_32px_-24px_rgba(32,25,16,0.5)] ring-0">
      <CardHeader className="px-4 pt-4 pb-2 sm:px-5">
        <div className="flex items-baseline justify-between gap-3">
          <CardTitle>This week</CardTitle>
          <span className="text-xs tabular-nums text-muted-foreground">{total} due</span>
        </div>
        <p className="text-xs text-muted-foreground">The shape of your next seven days</p>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-5">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2" aria-label="Tasks due by day">
          {days.map((day, index) => {
            const height = day.count === 0 ? 0 : Math.max(1, Math.round(day.count / maximum * 5));
            return (
              <div key={day.key} className={`flex min-w-0 flex-col items-center rounded-lg px-1 py-2 ${index === 0 ? 'bg-stage-progress/10' : 'bg-muted/40'}`} aria-label={`${day.day} ${day.date}: ${day.count} tasks due`}>
                <span className="text-[11px] text-muted-foreground">{day.day}</span>
                <span className="mt-0.5 text-sm font-medium tabular-nums">{day.date}</span>
                <div className="mt-4 flex h-20 w-full max-w-9 flex-col-reverse gap-1" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, level) => (
                    <span key={level} className={`min-h-0 flex-1 rounded-[3px] ${level < height ? index === 0 ? 'bg-stage-progress' : 'bg-stage-done' : 'bg-border/40'}`} />
                  ))}
                </div>
                <span className="mt-3 text-xs font-medium tabular-nums">{day.count || '—'}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
