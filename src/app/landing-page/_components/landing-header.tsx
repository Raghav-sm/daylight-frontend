'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogoMark } from '@/components/layout/logo-mark';
import { ThemeMenu } from '@/components/layout/theme-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const startHref = '/projects';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#integrations', label: 'Integrations' },
  { href: '#faq', label: 'FAQ' },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={cn('sticky top-0 z-40 border-b transition-colors duration-300', scrolled ? 'border-border bg-background/95 backdrop-blur-sm' : 'border-transparent bg-background')}>
      <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-3 px-5 py-4 sm:px-8 lg:px-10">
        <Link href="/landing-page" className="flex items-center gap-2 pl-1">
          <LogoMark size={20} />
          <span className="font-heading text-lg tracking-tight">Daylight</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeMenu />
          <Link href={startHref} className="hidden px-3 text-sm text-muted-foreground hover:text-foreground sm:inline">
            Login
          </Link>
          <Button asChild size="sm" className="rounded-full px-4">
            <Link href={startHref}>Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
