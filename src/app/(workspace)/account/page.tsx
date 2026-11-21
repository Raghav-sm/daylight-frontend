'use client';

import { useState, type FormEvent } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser, useUpdateProfile } from '@/features/auth/data';
import { ApiError } from '@/lib/api-client';

export default function AccountPage() {
  const currentUser = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState('');

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await updateProfile.mutateAsync({ name: name.trim() });
      setEditingName(false);
    } catch {
      // Keep the draft available so the user can retry.
    }
  }

  if (!currentUser.data) {
    return (
      <>
        <PageLayout
          maxWidthClassName="max-w-2xl"
          title="Account"
          subtitle="View and update your Daylight account details."
        />
        <div className="mx-auto w-full max-w-2xl">
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      </>
    );
  }

  const user = currentUser.data.user;
  const error = updateProfile.error instanceof ApiError
    ? updateProfile.error.message
    : 'Could not save your name. Try again.';

  return (
    <>
      <PageLayout
        maxWidthClassName="max-w-2xl"
        title="Account"
        subtitle="View and update your Daylight account details."
      />

      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your name appears in the Daylight sidebar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={saveName}>
              <div className="grid gap-3">
                {editingName ? (
                  <label htmlFor="account-name" className="text-sm font-medium">Name</label>
                ) : (
                  <p className="text-sm font-medium">Name</p>
                )}
                {editingName ? (
                  <>
                    <Input
                      id="account-name"
                      autoComplete="name"
                      required
                      minLength={1}
                      maxLength={100}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                    {updateProfile.isError && <p role="alert" className="text-sm text-destructive">{error}</p>}
                  </>
                ) : (
                  <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">{user.name}</p>
                )}
              </div>

              <div className="grid gap-2 border-t border-border pt-5">
                <p className="text-sm font-medium">Email</p>
                <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">This email is used to sign in.</p>
              </div>

              <div className="flex justify-end gap-2">
                {editingName ? (
                  <>
                    <Button type="button" variant="secondary" disabled={updateProfile.isPending} onClick={() => {
                      setName(user.name);
                      setEditingName(false);
                      updateProfile.reset();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateProfile.isPending || name.trim() === user.name}>
                      {updateProfile.isPending ? 'Saving…' : 'Save'}
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={() => {
                    setName(user.name);
                    setEditingName(true);
                  }}>
                    Make changes
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
