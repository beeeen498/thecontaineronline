import { getAllProducts } from "@/lib/shopifyQueries";
import Hero from "@/components/home/Hero/Hero";
import About from '@/components/home/About/About';

// ─── Homepage ─────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
    </>
  );
}
