import Link from 'next/link';
import { LogoMark } from '@/components/layout/logo-mark';

export function AuthBrand() {
  return (
    <Link href="/" aria-label="Daylight home" className="flex items-center justify-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <LogoMark size={26} />
      <span className="font-heading text-2xl font-semibold tracking-tight text-foreground">Daylight</span>
    </Link>
  );
}
