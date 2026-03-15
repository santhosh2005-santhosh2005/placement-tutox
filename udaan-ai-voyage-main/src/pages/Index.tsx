import Hero3D from '@/components/Hero3D';
import AboutSection from '@/components/AboutSection';
import FeaturesSection from '@/components/FeaturesSection';
import DemoSection from '@/components/DemoSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import Footer from '@/components/Footer';

export default function Index() {
  return (
    <div className="min-h-screen">
      <Hero3D />
      <AboutSection />
      <FeaturesSection />
      <DemoSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}
