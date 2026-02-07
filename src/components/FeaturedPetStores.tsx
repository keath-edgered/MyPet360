import VetCard from "./VetCard";

const stores = [
  {
    name: "PUPNPUSSY Sydney",
    image: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800&h=600&fit=crop",
    rating: 4.8,
    reviews: 128,
    address: "185 Campbell St, Surry Hills NSW 2010, PUPNPUSSY Sydney",
    distance: "1.2 km",
    isOpen: true,
    specialties: ["Dog Food", "Cat Food", "Supplements"],
  },
  {
    name: "The Pet Grocer",
    image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&h=600&fit=crop",
    rating: 4.7,
    reviews: 92,
    address: "126 Bank St, South Melbourne VIC 3205, The Pet Grocer",
    distance: "3.7 km",
    isOpen: true,
    specialties: ["Premium Food", "Grooming", "Toys"],
  },
  {
    name: "Brisbane Pet Super Store",
    image: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=800&h=600&fit=crop",
    rating: 4.6,
    reviews: 64,
    address: "Shopping Centre, Shop 100/400 Stafford Rd, Stafford QLD 4053, Brisbane Pet Super Store",
    distance: "2.0 km",
    isOpen: false,
    specialties: ["Treats", "Training Aids"],
  },
  {
    name: "Direct Pet Supplies Perth",
    image: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=800&h=600&fit=crop",
    rating: 4.9,
    reviews: 210,
    address: "Online Only, Perth WA 6000, Direct Pet Supplies Perth",
    distance: "4.0 km",
    isOpen: true,
    specialties: ["Aquatics", "Small Pets", "Food"],
  },
];

const FeaturedPetStores = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Featured Pet Stores</h2>
            <p className="mt-2 text-muted-foreground">Top-rated pet stores and suppliers around Australia</p>
          </div>
          <a href="#" className="hidden md:inline-flex text-sm font-medium text-primary hover:text-primary/80 transition-colors">View all stores →</a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stores.map((store, index) => (
            <div key={store.name} className="animate-fade-in-up h-full" style={{ animationDelay: `${index * 0.08}s` }}>
              <VetCard {...store} />
            </div>
          ))}
        </div>

        <a href="#" className="mt-8 md:hidden inline-flex text-sm font-medium text-primary hover:text-primary/80 transition-colors">View all stores →</a>
      </div>
    </section>
  );
};

export default FeaturedPetStores;
