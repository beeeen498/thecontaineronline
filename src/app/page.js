import { getAllProducts } from "@/lib/shopifyQueries";
import Hero from "@/components/home/Hero/Hero";
import About from "@/components/home/About/About";
import FeaturedItems from "@/components/home/FeaturedItems/FeaturedItems";

// ─── Homepage ─────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <FeaturedItems />
    </>
  );
}
