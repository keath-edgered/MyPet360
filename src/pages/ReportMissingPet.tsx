import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, ArrowLeft } from "lucide-react";

// Fix for default marker icons in leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationSearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const ReportMissingPet = () => {
  const navigate = useNavigate();
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("");
  const [breed, setBreed] = useState("");
  const [otherPetType, setOtherPetType] = useState("");
  const [description, setDescription] = useState("");
  const [lastSeen, setLastSeen] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [pinnedLocation, setPinnedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([-25.2744, 133.7751], 4); // Center of Australia
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      map.on("click", handleMapClick);
      mapRef.current = map;
    }
  }, []);

  const updateMarker = (lat: number, lng: number) => {
    if (mapRef.current) {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
      }
      mapRef.current.setView([lat, lng], 15);
      setPinnedLocation({ lat, lng });
    }
  };

  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    updateMarker(lat, lng);
    
    // Reverse geocode to get address
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data.display_name) {
        setLastSeen(data.display_name);
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      toast.error("Could not fetch address for the selected location.");
    }
  };

  const handleSearchResultClick = (result: LocationSearchResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    updateMarker(lat, lon);
    setLastSeen(result.display_name);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&countrycodes=au`);
      const data: LocationSearchResult[] = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Location search failed:", error);
      toast.error("Failed to search for location.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("You must be logged in to report a missing pet.");
      navigate("/login");
      return;
    }
    if (!petName || !petType || (petType === "Other" && !otherPetType) || !lastSeen || !pinnedLocation) {
      toast.error("Please fill in all required fields and pin a location on the map.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "missing_pets"), {
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName,
        petName,
        petType: petType === "Other" ? otherPetType : petType,
        breed,
        description,
        lastSeenLocationName: lastSeen,
        location: {
          latitude: pinnedLocation.lat,
          longitude: pinnedLocation.lng,
        },
        isPublic,
        status: 'missing',
        createdAt: serverTimestamp(),
      });
      toast.success(`${petName} has been reported missing.`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error reporting missing pet:", error);
      toast.error("There was an error submitting your report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-4xl px-6 pt-24 pb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="mb-6 text-3xl font-bold text-foreground">Report a Missing Pet</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Listing Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublic" className="flex flex-col space-y-1">
                  <span>Make Listing Public</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Allow anyone to see your missing pet report.
                  </span>
                </Label>
                <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pet Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="petName">Pet Name</Label>
                <Input id="petName" value={petName} onChange={e => setPetName(e.target.value)} placeholder="e.g., Buddy" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="petType"> {petType === "Other" ? "Specify Type" : "Type"} </Label>
                  <Select onValueChange={setPetType} value={petType}>
                    <SelectTrigger id="petType">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dog">Dog</SelectItem>
                      <SelectItem value="Cat">Cat</SelectItem>
                      <SelectItem value="Bird">Bird</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {petType === "Other" && (
                    <Input id="otherPetType" value={otherPetType} onChange={e => setOtherPetType(e.target.value)} placeholder="e.g., Ferret, Lizard" className="mt-2" required />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input id="breed" value={breed} onChange={e => setBreed(e.target.value)} placeholder="e.g., Golden Retriever" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Color, size, distinguishing marks, etc." />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Last Seen Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Search for an address or click on the map to pin the location.</p>
              <div className="relative">
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevent outer form submission
                      handleSearch();
                    }
                  }}
                  placeholder="Search for an address..."
                  className="pr-10"
                />
                <Button type="button" onClick={handleSearch} size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                  <Search className="h-4 w-4" />
                </Button>
                {searchResults.length > 0 && (
                  <div className="absolute z-[1000] w-full mt-1 bg-background border rounded-md shadow-lg">
                    {searchResults.map(result => (
                      <div key={result.place_id} onClick={() => handleSearchResultClick(result)} className="p-2 hover:bg-muted cursor-pointer text-sm">
                        {result.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div ref={mapContainerRef} className="h-96 w-full rounded-md border" />
              {lastSeen && (
                <div className="text-sm text-muted-foreground flex items-start gap-2 pt-2">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{lastSeen}</span>
                </div>
              )}
            </CardContent>
          </Card>
          <Button type="submit" disabled={isSubmitting} className="w-full md:w-full md:ml-full md:block">
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default ReportMissingPet;