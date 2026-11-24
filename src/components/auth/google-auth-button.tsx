'use client';

import { Button } from '@/components/ui/button';
import { authApi } from '@/features/auth/api';

type GoogleAuthButtonProps = {
  originPage: 'login' | 'register';
  disabled?: boolean;
  label?: string;
  oauthContinue?: string | null;
};

export function GoogleIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.26-2.08 3.57-5.15 3.57-8.64Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3a7.17 7.17 0 0 1-10.67-3.77H1.4v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.39 14.32a7.2 7.2 0 0 1 0-4.64V6.59H1.4a12 12 0 0 0 0 10.82l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.4 6.59l3.99 3.09A7.16 7.16 0 0 1 12 4.75Z"
      />
    </svg>
  );
}

export function GoogleAuthButton({
  originPage,
  disabled = false,
  label = 'Continue with Google',
  oauthContinue,
}: GoogleAuthButtonProps) {
  function handleContinueWithGoogle() {
    window.location.assign(authApi.googleStartUrl(originPage, '/dashboard', oauthContinue));
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={handleContinueWithGoogle}
      className="w-full"
    >
      <GoogleIcon />
      {label}
    </Button>
  );
}
