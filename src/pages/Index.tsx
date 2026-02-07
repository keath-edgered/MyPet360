import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedVets from "@/components/FeaturedVets";
import FeaturedPetStores from "../components/FeaturedPetStores";
import TrustSection from "@/components/TrustSection";
import TrustSectionStores from "@/components/TrustSectionStores";
import Footer from "@/components/Footer";
import { useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();
  const isPetFood = location.pathname.includes('/pet-food');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      {!isPetFood ? (
        <>
          <FeaturedVets />
          <TrustSection />
        </>
      ) : (
        <>
          <FeaturedPetStores />
          <TrustSectionStores />
        </>
      )}
      <Footer />
    </div>
  );
};

export default Index;
