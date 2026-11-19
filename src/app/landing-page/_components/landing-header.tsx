'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogoMark } from '@/components/layout/logo-mark';
import { ThemeMenu } from '@/components/layout/theme-menu';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/features/auth/data';
import { cn } from '@/lib/utils';

const startHref = '/projects';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#integrations', label: 'Integrations' },
  { href: '#faq', label: 'FAQ' },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const currentUser = useCurrentUser();
  const isLoggedIn = Boolean(currentUser.data?.user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={cn('sticky top-0 z-40 border-b transition-colors duration-300', scrolled ? 'border-border bg-background/95 backdrop-blur-sm' : 'border-transparent bg-transparent')}>
      <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-3 px-5 py-4 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-10">
        <Link href="/landing-page" className="flex items-center gap-2 pl-1">
          <LogoMark size={20} />
          <span className="font-heading text-lg font-[600] tracking-tight">Daylight</span>
        </Link>

        <nav className="hidden items-center gap-6 justify-self-center text-[15px] font-[600] text-foreground lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-opacity hover:opacity-70"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 lg:justify-self-end">
          <ThemeMenu />
          <Link href={isLoggedIn ? '/dashboard' : startHref} className="hidden px-3 text-[15px] font-[600] text-foreground transition-opacity hover:opacity-70 sm:inline">
            {isLoggedIn ? 'Dashboard' : 'Login'}
          </Link>
          <Button asChild size="sm" className="rounded-full px-4">
            <Link href={startHref}>Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
