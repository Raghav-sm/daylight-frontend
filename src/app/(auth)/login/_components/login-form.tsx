'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AuthBrand } from '@/components/auth/auth-brand';
import { ApiError } from '@/lib/api-client';
import { useLogin } from '@/features/auth/data';

export function LoginForm() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      router.replace('/dashboard');
    } catch {
      // The mutation error is shown below.
    }
  }

  const error = login.error instanceof ApiError ? login.error.message : 'Could not sign in. Try again.';

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid justify-items-center gap-2 pb-1">
              <AuthBrand />
              <CardTitle className="text-center text-xl">Welcome back</CardTitle>
              <CardDescription className="text-center">Sign in to open your Daylight workspace.</CardDescription>
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input id="password" type="password" autoComplete="current-password" required minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            {login.isError && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={login.isPending}>
              {login.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            New to Daylight? <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">Create an account</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
