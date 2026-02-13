import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "@/firebase/firebase";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from 'uuid';
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc, GeoPoint } from "firebase/firestore";
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

// IMPORTANT: In a real app, move this to a separate supabase client file (e.g., src/supabase.ts)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Please check your .env file.");
}

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

interface LocationSearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const ReportMissingPet = () => {
  const { petId } = useParams<{ petId: string }>();
  const isEditMode = !!petId;
  const navigate = useNavigate();
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("");
  const [breed, setBreed] = useState("");
  const [otherPetType, setOtherPetType] = useState("");
  const [description, setDescription] = useState("");
  const [lastSeen, setLastSeen] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState<'missing' | 'reunited'>("missing");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

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

  useEffect(() => {
    if (isEditMode && petId) {
      const fetchPetData = async () => {
        const docRef = doc(db, "missing_pets", petId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const petData = docSnap.data();
          if (petData.ownerId !== auth.currentUser?.uid) {
            toast.error("You are not authorized to edit this listing.");
            navigate("/dashboard");
            return;
          }

          setPetName(petData.petName);
          if (!["Dog", "Cat", "Bird"].includes(petData.petType)) {
            setPetType("Other");
            setOtherPetType(petData.petType);
          } else {
            setPetType(petData.petType);
          }
          setBreed(petData.breed || "");
          setDescription(petData.description || "");
          setLastSeen(petData.lastSeenLocationName);
          setIsPublic(petData.isPublic);
          setStatus(petData.status || 'missing');
          if (petData.location) {
            const { latitude, longitude } = petData.location;
            setPinnedLocation({ lat: latitude, lng: longitude });
          }
          setExistingImageUrl(petData.imageUrl || null);
          setImagePreview(petData.imageUrl || null);
        } else {
          toast.error("Pet listing not found.");
          navigate("/dashboard");
        }
      };
      fetchPetData();
    }
  }, [isEditMode, petId, navigate]);

  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setPinnedLocation({ lat, lng });
    
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
    setPinnedLocation({ lat, lng: lon });
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

  useEffect(() => {
    if (mapRef.current && pinnedLocation) {
      const { lat, lng } = pinnedLocation;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
      }
      mapRef.current.setView([lat, lng], 15);
    }
  }, [pinnedLocation]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
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
    let imageUrl = existingImageUrl; // Start with existing image URL

    if (imageFile) {
      setIsUploading(true);
      try {
        // Create a unique path for the image. Using user ID for ownership.
        const fileName = `${currentUser.uid}/${uuidv4()}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("pet-images") // User must create this bucket in Supabase and set public read access.
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL of the uploaded image
        const { data: urlData } = supabase.storage
          .from("pet-images")
          .getPublicUrl(uploadData.path);
        
        imageUrl = urlData.publicUrl;

      } catch (error) {
        console.error("Error uploading image to Supabase:", error);
        toast.error("Failed to upload image. Please try again.");
        setIsSubmitting(false);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }
    const petDataObject = {
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
      status: status,
      imageUrl: imageUrl || "",
    };

    try {
      if (isEditMode && petId) {
        const docRef = doc(db, "missing_pets", petId);
        await updateDoc(docRef, petDataObject);
        toast.success(`${petName}'s listing has been updated.`);
      } else {
        await addDoc(collection(db, "missing_pets"), {
          ...petDataObject,
          ownerId: currentUser.uid,
          ownerName: currentUser.displayName,
          createdAt: serverTimestamp(),
        });
        toast.success(`${petName} has been reported missing.`);
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Error reporting missing pet:", error);
      toast.error(`There was an error ${isEditMode ? 'updating' : 'submitting'} your report. Please try again.`);
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
        <h1 className="mb-6 text-3xl font-bold text-foreground">
          {isEditMode ? "Edit Missing Pet Report" : "Report a Missing Pet"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Listing Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublic" className="flex flex-col space-y-1">
                  <span>Make Listing Public</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Allow anyone to see your missing pet report.
                  </span>
                </Label>
                <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
              {isEditMode && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <Label htmlFor="status" className="flex flex-col space-y-1">
                    <span>Pet Status</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Mark your pet as 'reunited' when you've been reunited.
                    </span>
                  </Label>
                  <Select onValueChange={(value) => setStatus(value as 'missing' | 'reunited')} value={status}>
                    <SelectTrigger id="status" className="w-[180px]">
                      <SelectValue placeholder="Set status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="missing">Missing</SelectItem>
                      <SelectItem value="reunited">Reunited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pet Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="petImage">Pet Image</Label>
                <Input id="petImage" type="file" accept="image/*" onChange={handleImageChange} className="h-15 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                {imagePreview && (
                  <div className="mt-4">
                    <img src={imagePreview} alt="Pet preview" className="w-32 h-32 object-cover rounded-md border" />
                  </div>
                )}
              </div>
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
          <Button type="submit" disabled={isSubmitting || isUploading} className="w-full md:w-full md:ml-full md:block">
            {isSubmitting ? (isUploading ? "Uploading Image..." : (isEditMode ? "Saving..." : "Submitting...")) : (isEditMode ? "Save Changes" : "Submit Report")}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default ReportMissingPet;