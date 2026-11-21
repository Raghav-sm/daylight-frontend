import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { SectionFrame } from './section-frame';

const startHref = '/projects';

const footerLinks = [
  { href: '#features', label: 'Features' },
  { href: '#integrations', label: 'Integrations' },
  { href: '#faq', label: 'FAQ' },
];

export function LandingFooter() {
  return (
    <SectionFrame padded={false}>
      <div className="flex flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 md:px-10">
        <Link href="/landing-page" className="flex items-center gap-2">
          <Logo size="sidebar" />
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <Link href={startHref} className="transition-colors hover:text-foreground">
            Sign in
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground sm:text-right">
          A clear space for your tasks.
        </p>
      </div>
    </SectionFrame>
  );
}
