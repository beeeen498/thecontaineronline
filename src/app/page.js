import Hero from '@/components/home/Hero/Hero';
import FeaturedItems from '@/components/home/FeaturedItems/FeaturedItems';
import About from '@/components/home/About/About';
import ContactUs from '@/components/home/ContactUs/ContactUs';

// ─── Homepage ─────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedItems />
      <About />
      <ContactUs />
    </>
  );
}