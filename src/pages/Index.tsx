import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ProductDetailsSection from "@/components/ProductDetailsSection";
import WorkflowSection from "@/components/WorkflowSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <ProductDetailsSection />
      <WorkflowSection />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
