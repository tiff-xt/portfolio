import { Nav } from "@/components/Nav";
import { Hero } from "@/components/hero/Hero";
import { Approach } from "@/components/sections/Approach";
import { Skills } from "@/components/sections/Skills";
import { Work } from "@/components/sections/Work";
import { OffTheClock } from "@/components/sections/OffTheClock";
import { Assistant } from "@/components/assistant/Assistant";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Approach />
        <Skills />
        <Work />
        <Assistant />
        <OffTheClock />
      </main>
      <Footer />
    </>
  );
}
