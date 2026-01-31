import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedVets from "@/components/FeaturedVets";
import TrustSection from "@/components/TrustSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <FeaturedVets />
      <TrustSection />
      <Footer />
    </div>
  );
};

export default Index;
