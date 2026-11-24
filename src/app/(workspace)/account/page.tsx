'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageLayout } from '@/components/layout/page-layout';
import { GoogleIcon } from '@/components/auth/google-auth-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getGoogleAuthErrorMessage } from '@/features/auth/api';
import {
  useCurrentUser,
  useConnectedApps,
  useDisconnectApp,
  useGoogleAuthStatus,
  useStartGoogleLink,
  useUnlinkGoogle,
  useUpdateProfile,
} from '@/features/auth/data';
import { ApiError } from '@/lib/api-client';

function GoogleSignInSection({ canLinkGoogle }: { canLinkGoogle: boolean }) {
  const searchParams = useSearchParams();
  const googleStatus = useGoogleAuthStatus();
  const startLink = useStartGoogleLink();
  const unlinkGoogle = useUnlinkGoogle();
  const [unlinkedNotice, setUnlinkedNotice] = useState(false);

  const googleCallbackError = getGoogleAuthErrorMessage(searchParams.get('google_error'));

  async function handleLinkGoogle() {
    setUnlinkedNotice(false);
    try {
      const response = await startLink.mutateAsync();
      window.location.assign(response.authorizationUrl);
    } catch {
      // Error is shown inline below.
    }
  }

  async function handleUnlinkGoogle() {
    setUnlinkedNotice(false);
    try {
      await unlinkGoogle.mutateAsync();
      setUnlinkedNotice(true);
    } catch {
      // Error is shown inline below.
    }
  }

  const actionError = startLink.error instanceof ApiError
    ? startLink.error.message
    : unlinkGoogle.error instanceof ApiError
      ? unlinkGoogle.error.message
      : startLink.isError || unlinkGoogle.isError
        ? 'Could not update your Google connection. Try again.'
        : null;

  const status = googleStatus.data;

  return (
    <section aria-labelledby="sign-in-methods-title" className="space-y-4 pt-2">
      <div className="space-y-1">
        <h2 id="sign-in-methods-title" className="text-sm font-medium">Sign-in methods</h2>
        <p className="text-sm text-muted-foreground">Link your Google account so you can sign in with Google.</p>
      </div>
      {unlinkedNotice && (
        <p role="status" className="rounded-lg border border-border bg-secondary/60 px-3 py-2 text-sm text-foreground">
          Google account unlinked.
        </p>
      )}
      {(googleCallbackError || actionError) && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {actionError ?? googleCallbackError}
        </p>
      )}

      {googleStatus.isLoading ? (
        <Skeleton className="h-14 w-full rounded-lg" />
      ) : googleStatus.isError || !status ? (
        <p className="text-sm text-muted-foreground">Could not load Google sign-in status.</p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3.5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
              <GoogleIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Google</p>
                {status.linked ? (
                  <Badge variant="outline" className="border-stage-done/30 bg-stage-done/10 text-stage-done">Connected</Badge>
                ) : (
                  <Badge variant="outline">Not linked</Badge>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {status.linked
                  ? status.linkedEmail ?? 'Linked to your Google account'
                  : status.configured
                    ? canLinkGoogle
                      ? 'Use your Google account to sign in to Daylight.'
                      : 'Click Make changes to enable Google linking.'
                    : 'Google sign-in is not configured on the backend yet.'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {status.linked ? (
              status.canUnlink ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canLinkGoogle || unlinkGoogle.isPending}
                  onClick={handleUnlinkGoogle}
                >
                  {unlinkGoogle.isPending ? 'Unlinking…' : 'Unlink'}
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">Primary sign-in method</p>
              )
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!status.configured || !canLinkGoogle || startLink.isPending}
                onClick={handleLinkGoogle}
              >
                {startLink.isPending ? 'Redirecting…' : 'Link Google'}
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function ConnectedAppsSection({ canDisconnect }: { canDisconnect: boolean }) {
  const connectedApps = useConnectedApps();
  const disconnect = useDisconnectApp();

  return (
    <section aria-labelledby="connected-apps-title" className="space-y-4 pt-2">
      <div className="space-y-1">
        <h2 id="connected-apps-title" className="text-sm font-medium">Connected apps</h2>
        <p className="text-sm text-muted-foreground">Apps you approved to access your Daylight projects and tasks.</p>
      </div>
      {disconnect.isError && (
        <p role="alert" className="text-sm text-destructive">
          {disconnect.error instanceof ApiError ? disconnect.error.message : 'Could not disconnect the app. Try again.'}
        </p>
      )}
      {connectedApps.isLoading ? (
        <Skeleton className="h-14 w-full rounded-lg" />
      ) : connectedApps.isError ? (
        <p className="text-sm text-muted-foreground">Could not load connected apps.</p>
      ) : connectedApps.data?.length ? (
        <div className="space-y-2">
          {connectedApps.data.map((app) => (
            <div key={app.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3.5 py-3">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium">{app.name}</p>
                <p className="text-xs text-muted-foreground">
                  {app.scopes.includes('daylight:read') && app.scopes.includes('daylight:write')
                    ? 'Read projects and tasks · Create and move tasks'
                    : app.scopes.includes('daylight:write')
                      ? 'Create and move tasks'
                      : 'Read projects and tasks'}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm"
                disabled={!canDisconnect || disconnect.isPending}
                onClick={() => disconnect.mutate(app.id)}>
                {disconnect.isPending && disconnect.variables === app.id ? 'Disconnecting…' : 'Disconnect'}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No apps connected yet.</p>
      )}
    </section>
  );
}

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
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <Skeleton className="h-96 w-full rounded-xl" />
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
            <CardTitle>Account details</CardTitle>
            <CardDescription>Manage your personal information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="account-profile-form" className="space-y-6" onSubmit={saveName}>
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

              <div className="grid gap-2">
                <p className="text-sm font-medium">Email</p>
                <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">{user.email}</p>
              </div>

              <Suspense fallback={<Skeleton className="h-36 w-full rounded-xl" />}>
                <GoogleSignInSection canLinkGoogle={editingName} />
              </Suspense>

              <ConnectedAppsSection canDisconnect={editingName} />

              <div className="flex justify-end gap-2 pt-1">
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
