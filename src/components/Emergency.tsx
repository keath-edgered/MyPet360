import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Phone, MapPin, Clock, AlertTriangle, Heart, ArrowLeft, Search, Shield, Thermometer, Bug, Bone, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState, useMemo, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import useOpenStreetMapSearch from "@/hooks/useOpenStreetMapSearch";
import { Vet } from "@/types";

const whatToDos = [
  {
    title: "My pet is choking",
    icon: AlertTriangle,
    steps: [
      "Stay calm and restrain your pet carefully.",
      "Open the mouth and look for a visible obstruction.",
      "If visible, try to gently remove it with tweezers — do not push it further.",
      "For small dogs/cats: hold them upside down and apply firm back blows.",
      "For large dogs: perform the Heimlich manoeuvre by placing your fist behind the rib cage and pushing up.",
      "Seek veterinary attention immediately, even if the object is removed.",
    ],
  },
  {
    title: "My pet has been poisoned",
    icon: Bug,
    steps: [
      "Identify the substance if possible — keep the packaging.",
      "Do NOT induce vomiting unless instructed by a vet.",
      "Call Animal Poison Control immediately: 1300 869 738.",
      "Note the time of ingestion and the amount consumed.",
      "Bring a sample of the substance to the vet clinic.",
      "Monitor breathing and consciousness while transporting.",
    ],
  },
  {
    title: "My pet has a broken bone",
    icon: Bone,
    steps: [
      "Keep your pet as still and calm as possible.",
      "Do not attempt to set or splint the bone yourself.",
      "Use a flat board or towel as a stretcher for transport.",
      "Muzzle your pet gently — injured animals may bite from pain.",
      "Apply a cold pack wrapped in cloth near the injury if possible.",
      "Transport to the nearest emergency vet immediately.",
    ],
  },
  {
    title: "My pet has heatstroke",
    icon: Thermometer,
    steps: [
      "Move your pet to a cool, shaded area immediately.",
      "Apply cool (not cold) water to the body, especially the neck and underarms.",
      "Place cool wet towels on the paw pads and groin area.",
      "Offer small amounts of cool water to drink — do not force it.",
      "Use a fan to increase air circulation around your pet.",
      "Transport to a vet even if your pet seems to recover.",
    ],
  },
  {
    title: "My pet is bleeding heavily",
    icon: Heart,
    steps: [
      "Apply direct pressure with a clean cloth or gauze.",
      "Do not remove the cloth if it soaks through — add more layers on top.",
      "If a limb is bleeding, elevate it above the heart if possible.",
      "Apply a pressure bandage if you have one available.",
      "Keep your pet calm and warm during transport.",
      "Head to the nearest emergency vet clinic immediately.",
    ],
  },
];

const Emergency = () => {
  const [locationSearch, setLocationSearch] = useState("");
  const [clinicNameSearch, setClinicNameSearch] = useState("");
  const [searchLocation, setSearchLocation] = useState<string>("");
  const [locationError, setLocationError] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const hotlines = [
    { name: "Emergency Animal Disease Hotline", number: "1800 675 888", tel: "1800675888", description: "For suspected EADs or pests.", icon: AlertTriangle },
    { name: "Animal Poisons Hotline (24/7)", number: "1300 869 738", tel: "1300869738", description: "Specialist advice for poisoned pets.", icon: Bug },
    { name: "Agricultural/Stock Emergencies (NSW)", number: "1800 814 647", tel: "1800814647", description: "For fodder, water, and welfare in disasters (NSW only).", icon: Shield },
  ];

  // Get user's location on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSearchLocation(`${latitude}, ${longitude}`);
          setLocationError("");
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to Sydney
          setSearchLocation("Sydney, NSW");
          setLocationError("Using default location (Sydney). Enable location for nearby results.");
        }
      );
    } else {
      // Browser doesn't support geolocation
      setSearchLocation("Sydney, NSW");
      setLocationError("Geolocation not supported. Showing results for Sydney.");
    }
  }, []);

  const { data: vets, loading, error } = useOpenStreetMapSearch({
    location: searchLocation || "Sydney, NSW",
    query: "",
    category: "veterinary",
  });

  const filteredClinics = useMemo(() => {
    // Filter for emergency vets by name or specialty
    const emergencyClinics = vets.filter(c => {
      const nameLower = c.name.toLowerCase();
      const hasEmergencyInName = 
        nameLower.includes('emergency') || 
        nameLower.includes('24/7') ||
        nameLower.includes('24hr') ||
        nameLower.includes('24 hr') ||
        nameLower.includes('24-hour') ||
        nameLower.includes('after hours') ||
        nameLower.includes('urgent care');
      
      const hasEmergencySpecialty = c.specialties?.some(s => 
        s.toLowerCase().includes('emergency')
      );
      
      return hasEmergencyInName || hasEmergencySpecialty;
    });
    
    if (!clinicNameSearch) return emergencyClinics;
    
    return emergencyClinics.filter(
      (c) =>
        c.name.toLowerCase().includes(clinicNameSearch.toLowerCase()) ||
        c.address.toLowerCase().includes(clinicNameSearch.toLowerCase())
    );
  }, [vets, clinicNameSearch]);

  const handleLocationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationSearch.trim()) {
      setSearchLocation(locationSearch.trim());
      setLocationError("");
    }
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      setLocationError("Getting your location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSearchLocation(`${latitude}, ${longitude}`);
          setLocationSearch("");
          setLocationError("");
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError("Could not get your location. Please enter a city or suburb.");
        }
      );
    } else {
      setLocationError("Geolocation not supported by your browser.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Custom Header for Emergency Page */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              <h1 className="text-xl font-bold text-foreground">Emergency Help</h1>
            </div>
          </div>
          {currentUser && (
            <Link to="/dashboard">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Emergency Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-accent/10 border border-accent/20 p-6 flex items-start gap-4"
        >
          <div className="bg-accent/20 rounded-full p-3 mt-0.5">
            <Phone className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">In a pet emergency?</h2>
            <p className="text-muted-foreground text-sm">
              If your pet is in immediate danger, call your nearest 24/7 emergency vet clinic or use the hotlines below. Stay calm and act quickly.
            </p>
          </div>
        </motion.div>

        {/* Urgent Contact Information */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/50">
            <CardContent className="p-6 space-y-4 text-sm text-red-900 dark:text-red-300/90">
              <div className="flex items-center gap-3 text-red-800 dark:text-red-300">
                <AlertTriangle className="h-6 w-6" />
                <h2 className="text-lg font-bold">Urgent Contact Information</h2>
              </div>
              <p>
                For immediate, 24/7 reporting of suspected emergency animal diseases (EADs), pests, or unusual sickness in livestock and pets in Australia, call the <strong className="font-semibold">National Emergency Animal Disease Hotline</strong>.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {hotlines.map((h) => (
                  <Card key={h.number} className="bg-background/50 border-red-300 dark:border-red-700/50 card-shadow hover:card-shadow-hover transition-shadow">
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-2.5 mt-1">
                        <h.icon className="h-5 w-5 text-red-600 dark:text-red-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-red-900 dark:text-red-200 text-sm">{h.name}</p>
                        <p className="text-xs text-red-700 dark:text-red-300/80 mb-1.5">{h.description}</p>
                        <a href={`tel:${h.tel}`} className="text-red-800 dark:text-red-200 font-bold text-base hover:underline">
                          {h.number}
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-xs italic">
                The National Hotline service links to your state/territory authority for urgent biosecurity concerns. For general, non-emergency veterinary advice, please contact your local veterinarian directly.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Nearby Clinics */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Nearby Emergency Vet Clinics</h2>
          
          {/* Location Search */}
          <form onSubmit={handleLocationSearch} className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter city or suburb (e.g., Melbourne, Brisbane)..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="default">
              Search Location
            </Button>
            <Button type="button" variant="outline" onClick={handleUseMyLocation} className="gap-2">
              <Navigation className="h-4 w-4" />
              Use My Location
            </Button>
          </form>

          {locationError && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg text-sm text-amber-800 dark:text-amber-300">
              {locationError}
            </div>
          )}
          
          {/* Clinic Name Filter */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by clinic name..."
              value={clinicNameSearch}
              onChange={(e) => setClinicNameSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-3">
            {!searchLocation ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Getting your location...</p>
            ) : loading ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Searching for clinics...</p>
            ) : error ? (
              <p className="text-center text-destructive py-8 text-sm">{error}</p>
            ) : filteredClinics.length > 0 ? (
              filteredClinics.slice(0, 10).map((clinic) => (
                <Card key={clinic.id} className="card-shadow hover:card-shadow-hover transition-shadow">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{clinic.name}</p>
                        {clinic.isOpen !== undefined && (
                          <Badge variant="secondary" className={`text-xs border-0 ${clinic.isOpen ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                            {clinic.isOpen ? "Open" : "Closed"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{clinic.address}</span>
                        {clinic.distance && <span>{clinic.distance} away</span>}
                      </div>
                    </div>
                    <a href={`https://www.google.com/maps?q=${clinic.latitude},${clinic.longitude}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        Map
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))
            ) : vets.length > 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-2">No emergency clinics found in this area.</p>
                <p className="text-xs text-muted-foreground">Showing all nearby vets instead:</p>
                <div className="mt-4 space-y-3">
                  {vets.slice(0, 10).map((clinic) => (
                    <Card key={clinic.id} className="card-shadow hover:card-shadow-hover transition-shadow">
                      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground">{clinic.name}</p>
                            {clinic.isOpen !== undefined && (
                              <Badge variant="secondary" className={`text-xs border-0 ${clinic.isOpen ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                                {clinic.isOpen ? "Open" : "Closed"}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{clinic.address}</span>
                            {clinic.distance && <span>{clinic.distance} away</span>}
                          </div>
                        </div>
                        <a href={`https://www.google.com/maps?q=${clinic.latitude},${clinic.longitude}`} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            Map
                          </Button>
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8 text-sm">No veterinary clinics found in this area.</p>
            )}
          </div>
        </motion.section>

        {/* What To Do */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">What To Do In An Emergency</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {whatToDos.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border rounded-xl px-4 card-shadow">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent/10 rounded-full p-2">
                      <item.icon className="h-4 w-4 text-accent" />
                    </div>
                    <span className="font-medium text-foreground text-sm">{item.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground pl-11">
                    {item.steps.map((step, j) => (
                      <li key={j}>{step}</li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.section>
      </main>
    </div>
  );
};

export default Emergency;