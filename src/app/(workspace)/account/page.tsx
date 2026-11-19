'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCurrentUser, useUpdateProfile } from '@/features/auth/data';
import { ApiError } from '@/lib/api-client';

export default function AccountPage() {
  const currentUser = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(currentUser.data?.user.name ?? '');

  useEffect(() => {
    if (!editingName && currentUser.data) setName(currentUser.data.user.name);
  }, [currentUser.data, editingName]);

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await updateProfile.mutateAsync({ name });
      setEditingName(false);
    } catch {
      // Keep the draft available so the user can retry.
    }
  }

  if (!currentUser.data) {
    return <p className="text-sm text-muted-foreground">Loading account…</p>;
  }

  const user = currentUser.data.user;
  const error = updateProfile.error instanceof ApiError
    ? updateProfile.error.message
    : 'Could not save your name. Try again.';

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">View and update your Daylight account details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your name appears in the Daylight sidebar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="grid gap-3" onSubmit={saveName}>
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="account-name" className="text-sm font-medium">Name</label>
              {!editingName && (
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingName(true)}>
                  Edit name
                </Button>
              )}
            </div>
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
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => {
                    setName(user.name);
                    setEditingName(false);
                    updateProfile.reset();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? 'Saving…' : 'Save name'}
                  </Button>
                </div>
              </>
            ) : (
              <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">{user.name}</p>
            )}
          </form>

          <div className="grid gap-2 border-t border-border pt-5">
            <p className="text-sm font-medium">Email</p>
            <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">This email is used to sign in.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
