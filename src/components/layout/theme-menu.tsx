'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const subscribe = () => () => {};

export function ThemeMenu() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="sm" aria-label="Choose theme">
          Theme
          <ChevronDown aria-hidden="true" className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-32">
        <DropdownMenuItem onSelect={() => setTheme('light')}>
          Light
          {mounted && theme === 'light' && <Check aria-hidden="true" className="ml-auto size-3.5" />}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme('dark')}>
          Dark
          {mounted && theme === 'dark' && <Check aria-hidden="true" className="ml-auto size-3.5" />}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme('system')}>
          System
          {mounted && theme === 'system' && <Check aria-hidden="true" className="ml-auto size-3.5" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
