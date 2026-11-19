import type { Metadata } from 'next';
import { LandingHeader } from './_components/landing-header';
import { HeroSection } from './_components/hero-section';
import { ProductPreviewSection } from './_components/product-preview-section';
import { FeaturesSection } from './_components/features-section';
import { IntegrationSection } from './_components/integration-section';
import { FaqSection } from './_components/faq-section';
import { CallToActionSection } from './_components/call-to-action-section';
import { LandingFooter } from './_components/landing-footer';
import './landing-page.css';

export const metadata: Metadata = {
  title: 'Daylight — A clear space for your tasks',
  description:
    'Projects, tasks, and a helping hand. Organize your work on a board—or simply ask Daylight.',
};

export default function LandingPage() {
  return (
    <main className="landing-entrance min-h-screen bg-background text-foreground">
      <LandingHeader />
      <HeroSection />
      <ProductPreviewSection />
      <FeaturesSection />
      <IntegrationSection />
      <FaqSection />
      <CallToActionSection />
      <LandingFooter />
    </main>
  );
}
