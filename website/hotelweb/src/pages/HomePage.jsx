import HeroSection from './sections/HeroSection';
import HorizontalGallerySection from './sections/HorizontalGallerySection';
import ActivitiesSection from './sections/ActivitiesSection';
import TargetAudienceSection from './sections/TargetAudienceSection';
import TestimonialsSection from './sections/TestimonialsSection';
import AvailabilitySection from './sections/AvailabilitySection';
import HomeFooter from './sections/HomeFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-chalet-bg flex flex-col font-sans">
      <HeroSection />
      <HorizontalGallerySection />
      <ActivitiesSection />
      <TargetAudienceSection />
      <TestimonialsSection />
      <AvailabilitySection />
      <HomeFooter />
    </div>
  );
}
