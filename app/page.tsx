import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CinematicExperience from "@/components/CinematicExperience";
import DesignGallery from "@/components/DesignGallery";
import HowItWorks from "@/components/HowItWorks";
import Occasions from "@/components/Occasions";
import ForEveryFaith from "@/components/ForEveryFaith";
import WhyMehfill from "@/components/WhyMehfill";
import FeatureShowcase from "@/components/FeatureShowcase";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import BrandMoment from "@/components/BrandMoment";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <CinematicExperience />
      <DesignGallery />
      <HowItWorks />
      <Occasions />
      <ForEveryFaith />
      <WhyMehfill />
      <FeatureShowcase />
      <Pricing />
      <Testimonials />
      <FAQ />
      <BrandMoment />
      <CTA />
      <Footer />
    </main>
  );
}
