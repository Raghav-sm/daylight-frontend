import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionFrame } from './section-frame';
import { SectionIntro } from './section-intro';

const startHref = '/projects';

export function HeroSection() {
  return (
    <div className="landing-hero-scene">
      <SectionFrame reveal={false} className="max-w-[1320px] pt-12 pb-12 sm:pt-16 sm:pb-16">
        <div className="mx-auto max-w-5xl">
          <SectionIntro
            level="h1"
            prominent
            title="Your day, with room to breathe."
            description="Work directly on your board or ask Daylight to handle an update. Through MCP, your AI tools can work with those same projects and tasks."
          />
          <div className="landing-hero-actions mt-9 flex flex-wrap items-center justify-center gap-3">
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
          <div className="landing-hero-details mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground sm:mt-9">
            <span>Projects in view</span>
            <span className="hidden size-1 rounded-full bg-stage-progress sm:block" aria-hidden="true" />
            <span>Tasks in motion</span>
            <span className="hidden size-1 rounded-full bg-stage-progress sm:block" aria-hidden="true" />
            <span>Every change visible</span>
          </div>
        </div>
      </SectionFrame>
    </div>
  );
}
