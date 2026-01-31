import { Search, MapPin } from "lucide-react";
import { useState } from "react";

const Hero = () => {
  const [location, setLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="hero-gradient min-h-[70vh] flex items-center pt-16">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight animate-fade-in">
            Find trusted vets
            <span className="block text-primary mt-2">near you</span>
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground max-w-lg mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Connect with qualified veterinarians across Australia. 
            Quality care for your beloved pets, just around the corner.
          </p>

          <div 
            className="mt-10 bg-card rounded-2xl card-shadow p-2 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter suburb or postcode"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-muted/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or service"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-muted/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              
              <button className="px-8 py-4 bg-accent text-accent-foreground font-medium rounded-xl hover:bg-accent/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Search
              </button>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              5,000+ Vets
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              All States
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              24/7 Emergency
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
