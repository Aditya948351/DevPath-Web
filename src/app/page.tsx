import Hero from '@/components/home/Hero';
import { SectionDivider } from '@/components/SectionDivider';
import { SectionEntrance } from '@/components/ui/SectionEntrance';
import { FloatingParticles } from '@/components/FloatingParticles';
import Events from '@/components/home/Events';
import Sponsors from '@/components/home/Sponsors';
import LatestEventsHighlight from '@/components/home/LatestEventsHighlight';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <FloatingParticles />
      <Hero />

      <LatestEventsHighlight />

      <div id="events-section">
        <SectionEntrance delay={0.2}>
          <Events />
        </SectionEntrance>
      </div>

      <SectionEntrance>
        <SectionDivider />
      </SectionEntrance>

      <div id="sponsors-section">
        <SectionEntrance delay={0.2}>
          <Sponsors />
        </SectionEntrance>
      </div>
    </main>
  );
}
