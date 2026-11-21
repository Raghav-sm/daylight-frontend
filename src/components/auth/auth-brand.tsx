import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
export function AuthBrand() {
  return (
    <Link href="/" aria-label="Daylight home" className="flex items-center justify-center rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <Logo size={32} />
    </Link>
  );
}
