import Hero from '@/components/home/Hero';
import { SectionDivider } from '@/components/SectionDivider';
import { SectionEntrance } from '@/components/ui/SectionEntrance';
import { FloatingParticles } from '@/components/FloatingParticles';
import Events from '@/components/home/Events';
import Sponsors from '@/components/home/Sponsors';

import Mission from '@/components/home/Mission';
import CodingNews from '@/components/home/CodingNews';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <FloatingParticles />
      <Hero />



      <SectionEntrance delay={0.1}>
        <CodingNews />
      </SectionEntrance>



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

      <SectionEntrance delay={0.2}>
        <Mission />
      </SectionEntrance>
    </main>
  );
}
