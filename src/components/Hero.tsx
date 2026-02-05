import { Search, MapPin, Locate } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const Hero = () => {
  const [location, setLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const navigate = useNavigate();
  const locationHook = useLocation();

  const urlParams = new URLSearchParams(locationHook.search);
  const categoryParam = urlParams.get('category') || (locationHook.pathname.includes('/pet-food') ? 'petfood' : 'veterinary');
  const isPetFood = categoryParam === 'petfood';

  const handleUseMyLocation = async () => {
    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Try to get location name via reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=13&addressdetails=1`
        );
        const data = await response.json();
        const locationName = data.address?.postcode || data.address?.suburb || data.address?.city || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setLocation(locationName);
      } catch (e) {
        // Fallback to coordinates if reverse geocoding fails
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (error: any) {
      if (error.code === 1) {
        alert("Location permission denied. Please enable location access in your browser settings.");
      } else if (error.code === 2) {
        alert("Unable to retrieve your location. Please try again or enter manually.");
      } else {
        alert("Error getting your location. Please try again.");
      }
    } finally {
      setIsLocating(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (searchQuery) params.append("query", searchQuery);
    const targetPath = isPetFood ? '/pet-food' : '/search';
    navigate(`${targetPath}?${params.toString()}`);
  };

  return (
    <section className="hero-gradient min-h-[70vh] flex items-center pt-16">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight animate-fade-in">
            {isPetFood ? 'Find trusted pet food stores' : 'Find trusted vets'}
            <span className="block text-primary mt-2">near you</span>
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground max-w-lg mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {isPetFood
              ? "Discover local stores offering a wide range of quality pet food across Australia. The best nutrition for your beloved pets is just around the corner."
              : "Connect with qualified veterinarians across Australia. Quality care for your beloved pets, just around the corner."
            }
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
                  className="w-full pl-12 pr-12 py-4 bg-muted/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleUseMyLocation}
                      disabled={isLocating}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      <Locate className={`w-5 h-5 ${isLocating ? "animate-spin" : ""}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Use current location</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={isPetFood ? "Search by brand or product" : "Search by name or service"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-muted/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              
              <button 
                onClick={handleSearch}
                className="px-8 py-4 bg-accent text-accent-foreground font-medium rounded-xl hover:bg-accent/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Search
              </button>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {isPetFood ? (
              <>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  1,000+ Stores
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Major Brands
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Local & Independent
                </span>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
