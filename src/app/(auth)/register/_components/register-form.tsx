'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AuthBrand } from '@/components/auth/auth-brand';
import { ApiError } from '@/lib/api-client';
import { useRegister } from '@/features/auth/data';

export function RegisterForm() {
  const router = useRouter();
  const register = useRegister();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await register.mutateAsync({ name, email, password });
      router.replace('/dashboard');
    } catch {
      // The mutation error is shown below.
    }
  }

  const error = register.error instanceof ApiError ? register.error.message : 'Could not create your account. Try again.';

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid justify-items-center gap-2 pb-1">
              <AuthBrand />
              <CardTitle className="text-center text-xl">Create your account</CardTitle>
              <CardDescription className="text-center">Start with a private Daylight workspace.</CardDescription>
            </div>
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input id="name" type="text" autoComplete="name" required minLength={1} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input id="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} />
              <p className="text-xs text-muted-foreground">Use at least 12 characters.</p>
            </div>
            {register.isError && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={register.isPending}>
              {register.isPending ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already registered? <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
