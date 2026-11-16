import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionFrame } from './section-frame';

const startHref = '/projects';

export function CallToActionSection() {
  return (
    <SectionFrame className="text-center">
      <h2 className="font-heading text-3xl tracking-tight sm:text-5xl">
        Start with one small thing.
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
        A project, a task, or a conversation. Daylight meets you where you already are.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="rounded-full px-6">
          <Link href={startHref}>
            Get started
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full px-6">
          <a href="#product-preview">See the walkthrough</a>
        </Button>
      </div>
    </SectionFrame>
  );
}
