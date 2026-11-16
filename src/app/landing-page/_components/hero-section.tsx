import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionFrame } from './section-frame';

const startHref = '/projects';

export function HeroSection() {
  return (
    <SectionFrame className="pt-20 pb-16 sm:pt-28 sm:pb-20">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-heading max-w-3xl text-5xl tracking-tight text-foreground sm:text-6xl md:text-7xl md:leading-[1.02]">
          Your day, with room to breathe.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Keep a project on its board. Move a task yourself, or ask Daylight to move it for you.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="rounded-full px-6">
            <Link href={startHref}>
              Get started
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-6">
            <a href="#product-preview">Learn more</a>
          </Button>
        </div>
      </div>
    </SectionFrame>
  );
}
