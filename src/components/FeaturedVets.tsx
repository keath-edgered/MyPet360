import VetCard from "./VetCard";

const vets = [
  {
    name: "Sydney Animal Hospitals",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=450&fit=crop",
    rating: 4.9,
    reviews: 312,
    address: "69-73 Erskineville Rd, Erskineville NSW 2043, Sydney Animal Hospitals",
    distance: "2.1 km",
    isOpen: true,
    specialties: ["Dogs", "Cats", "Surgery"],
  },
  {
    name: "Melbourne Dog Clinic",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=450&fit=crop",
    rating: 4.8,
    reviews: 256,
    address: "u2/1221 Toorak Rd, Camberwell VIC 3124, Melbourne Dog Clinic",
    distance: "3.5 km",
    isOpen: true,
    specialties: ["Emergency", "Exotic Pets"],
  },
  {
    name: "Fortitude Valley Vet",
    image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&h=450&fit=crop",
    rating: 4.7,
    reviews: 189,
    address: "Shop 15/1000 Ann St,Fortitude Valley QLD 4006, Fortitude Valley Vet",
    distance: "1.8 km",
    isOpen: false,
    specialties: ["Dental", "Vaccinations"],
  },
  {
    name: "Vogue Vets and Wellness Centre",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=450&fit=crop",
    rating: 4.9,
    reviews: 421,
    address: "5/36 Cedric St, Stirling WA 6021, Vogue Vets and Wellness Centre",
    distance: "4.2 km",
    isOpen: true,
    specialties: ["Rehabilitation", "Nutrition"],
  },
];

const FeaturedVets = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              Featured Clinics
            </h2>
            <p className="mt-2 text-muted-foreground">
              Top-rated veterinary clinics across Australia
            </p>
          </div>
          <a 
            href="#" 
            className="hidden md:inline-flex text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all clinics →
          </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vets.map((vet, index) => (
            <div 
              key={vet.name}
              className="animate-fade-in-up h-full"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <VetCard {...vet} />
            </div>
          ))}
        </div>
        
        <a 
          href="#" 
          className="mt-8 md:hidden inline-flex text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View all clinics →
        </a>
      </div>
    </section>
  );
};

export default FeaturedVets;
