'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api-client';
import { useCurrentUser } from '@/features/auth/data';
import { Button } from '@/components/ui/button';

export function WorkspaceAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const isUnauthorized = currentUser.error instanceof ApiError && currentUser.error.status === 401;

  useEffect(() => {
    if (isUnauthorized) router.replace('/login');
  }, [isUnauthorized, router]);

  useEffect(() => {
    function handleUnauthorized() {
      queryClient.clear();
      router.replace('/login');
    }
    window.addEventListener('daylight:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('daylight:unauthorized', handleUnauthorized);
  }, [queryClient, router]);

  if (currentUser.isLoading || isUnauthorized) {
    return <main className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">Loading your workspace…</main>;
  }

  if (currentUser.isError) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-muted-foreground">Could not check your sign-in. Check your connection and try again.</p>
        <Button variant="secondary" onClick={() => void currentUser.refetch()}>Try again</Button>
      </main>
    );
  }

  if (!currentUser.data) {
    return <main className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">Loading your workspace…</main>;
  }

  return children;
}
