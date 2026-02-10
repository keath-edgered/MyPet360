import { useState, lazy, Suspense, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PawPrint, Plus, MessageSquare, MapPin, Clock, Inbox, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Header from "@/components/Header";
import { auth, db } from "@/firebase/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { toast } from "sonner";
import { onAuthStateChanged, User } from "firebase/auth";

const InboxView = lazy(() => import("@/pages/InboxView"));

// Fix for default marker icons in leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MissingPet {
  id: string; // Firestore document ID
  ownerId: string;
  ownerName: string;
  petName: string;
  petType: string;
  breed?: string;
  description?: string;
  lastSeenLocationName: string;
  location: {
    latitude: number;
    longitude: number;
  };
  isPublic: boolean;
  status: 'missing'; // Or 'found', etc.
  createdAt: any; // Firestore Timestamp
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("pets");
  const navigate = useNavigate();
  const [missingPets, setMissingPets] = useState<MissingPet[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null); // To manage markers easily
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  const handleDelete = async (petId: string) => {
    try {
      await deleteDoc(doc(db, "missing_pets", petId));
      toast.success("Pet listing deleted successfully.");
    } catch (error) {
      console.error("Error deleting pet listing:", error);
      toast.error("Failed to delete pet listing. Please try again.");
    }
  };

  // Make the component reactive to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Map initialization
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([-25.2744, 133.7751], 4); // Center of Australia
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      markerLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    }
  }, []);

  // Fetching missing pets and updating map
  useEffect(() => {
    setLoadingPets(true);
    const unsubscribes: (() => void)[] = [];
    let publicListings: MissingPet[] = [];
    let privateListings: MissingPet[] = [];

    const updateCombinedPets = () => {
      const combined = [...publicListings];
      // Add private listings only if they are not already in public (which they shouldn't be by definition)
      // and if the current user is the owner.
      privateListings.forEach(privatePet => {
        if (!combined.some(publicPet => publicPet.id === privatePet.id)) {
          combined.push(privatePet);
        }
      });
      setMissingPets(combined);
      setLoadingPets(false);
    };

    // Fetch public listings
    const publicPetsQuery = query(
      collection(db, "missing_pets"),
      where("isPublic", "==", true)
    );
    const unsubscribePublic = onSnapshot(publicPetsQuery, (snapshot) => {
      publicListings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as MissingPet[];
      updateCombinedPets();
    }, (error) => {
      console.error("Error fetching public missing pets:", error);
      toast.error("Failed to load public missing pet listings.");
      setLoadingPets(false);
    });
    unsubscribes.push(unsubscribePublic);

    // Fetch private listings for the current user if logged in
    if (currentUser) {
      const privatePetsQuery = query(
        collection(db, "missing_pets"),
        where("ownerId", "==", currentUser.uid),
        where("isPublic", "==", false)
      );
      const unsubscribePrivate = onSnapshot(privatePetsQuery, (snapshot) => {
        privateListings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as MissingPet[];
        updateCombinedPets();
      }, (error) => {
        console.error("Error fetching private missing pets:", error);
        toast.error("Failed to load your private missing pet listings.");
        setLoadingPets(false);
      });
      unsubscribes.push(unsubscribePrivate);
    } else {
      // If no current user, ensure privateListings is empty
      privateListings = [];
      updateCombinedPets();
    }

    return () => unsubscribes.forEach(unsub => unsub());
  }, [currentUser]); // Re-run when auth.currentUser changes

  // Update map markers when missingPets changes
  useEffect(() => {
    if (mapRef.current && markerLayerRef.current) {
      markerLayerRef.current.clearLayers(); // Clear existing markers

      const bounds = L.latLngBounds([]);
      missingPets.forEach(pet => {
        if (pet.location?.latitude && pet.location?.longitude) {
          const marker = L.marker([pet.location.latitude, pet.location.longitude])
            .bindPopup(`
              <div class="p-1">
                <h3 class="font-bold text-sm">${pet.petName} (${pet.petType})</h3>
                <p class="text-xs text-gray-600 mt-1">Last seen: ${pet.lastSeenLocationName}</p>
                <p class="text-xs text-gray-600">Owner: ${pet.ownerName}</p>
                <button id="contact-owner-${pet.id}" class="mt-2 text-xs text-blue-600 hover:underline">Contact Owner</button>
              </div>
            `);
          
          marker.on('popupopen', () => {
            const contactButton = document.getElementById(`contact-owner-${pet.id}`);
            if (contactButton) {
              contactButton.onclick = () => handlePetClick(pet);
            }
          });

          markerLayerRef.current?.addLayer(marker);
          bounds.extend([pet.location.latitude, pet.location.longitude]);
        }
      });

      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
      } else {
        mapRef.current.setView([-25.2744, 133.7751], 4); // Default to Australia center
      }
    }
  }, [missingPets, currentUser]); // Depend on missingPets and currentUser

  // Invalidate map size when tab becomes active to fix rendering issues
  useEffect(() => {
    if (activeTab === 'pets' && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100); // A small delay ensures the container is visible and sized correctly
    }
  }, [activeTab]);

  const handlePetClick = async (pet: MissingPet) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("You must be logged in to contact the owner.");
      navigate("/login");
      return;
    }

    if (currentUser.uid === pet.ownerId) {
      toast.info("This is your own pet listing."); // If it's their own pet, just go to inbox
      return;
    }

    // Check if a conversation already exists to avoid duplicates
    const chatsRef = collection(db, "ChatApp");
    const q = query(
      chatsRef,
      where("participants", "array-contains", currentUser.uid), // Check if current user is a participant
      where("relatedPetName", "==", pet.petName) // Check for chat about this specific pet
    );

    const querySnapshot = await getDocs(q);
    let chatExists = false;
    querySnapshot.forEach(doc => {
      if (doc.data().participants.includes(pet.ownerId)) {
        chatExists = true;
      }
    });

    if (!chatExists) {
      // Create a new conversation
      const userInitials = currentUser.displayName?.split(" ").map(n => n[0]).join("") || "U";
      const ownerInitials = pet.ownerName?.split(" ").map(n => n[0]).join("") || "O";

      await addDoc(chatsRef, {
        participants: [currentUser.uid, pet.ownerId],
        participantInfo: {
          [currentUser.uid]: {
            name: currentUser.displayName,
            initials: userInitials,
          },
          [pet.ownerId]: {
            name: pet.ownerName,
            initials: ownerInitials,
          },
        },
        relatedPetName: pet.petName,
        lastUpdatedAt: serverTimestamp(),
      });
      toast.success(`Chat started with ${pet.ownerName} about ${pet.petName}.`);
    }

    setActiveTab("inbox");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="mb-1 text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Manage your missing pet listings and messages.
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="pets" className="gap-2">
                <PawPrint className="h-4 w-4" />
                Missing Pets
              </TabsTrigger>
              <TabsTrigger value="inbox" className="gap-2">
                <Inbox className="h-4 w-4" />
                Inbox
                {/* The unread count badge can be added back by lifting state from InboxView */}
              </TabsTrigger>
            </TabsList>

            {/* Missing Pets Tab */}
            <TabsContent value="pets" className="space-y-4" forceMount>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-semibold">
                  {loadingPets ? "Loading listings..." : `${missingPets.length} active listing${missingPets.length !== 1 ? 's' : ''}`}
                </p>
                <Button size="sm" className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate('/report-missing-pet')}>
                  <Plus className="h-4 w-4" />
                  Report Missing Pet
                </Button>
              </div>

              <div ref={mapContainerRef} className="h-[500px] w-full rounded-md border" />

              {loadingPets ? (
                <div className="py-16 text-center text-muted-foreground">Loading missing pet listings...</div>
              ) : missingPets.length > 0 ? (
                missingPets.map((pet, i) => (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                  onClick={() => handlePetClick(pet)}
                >
                  <Card className="cursor-pointer transition-all hover:-translate-y-0.5 hover:card-shadow-hover">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                        <PawPrint className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-card-foreground">{pet.petName}</h3>
                          <Badge variant="outline" className="text-xs">
                            {pet.petType} · {pet.breed}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {pet.lastSeenLocationName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {pet.createdAt ? new Date(pet.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-auto flex flex-col items-end gap-1 self-start pl-4">
                        <Badge className="shrink-0 rounded-full bg-destructive/10 text-destructive">
                          Missing
                        </Badge>
                        {currentUser?.uid === pet.ownerId && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="z-[1100]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the listing for <strong>{pet.petName}</strong>.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => handleDelete(pet.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                ))
              ) : (
                <div className="py-16 text-center text-muted-foreground">
                  <PawPrint className="mx-auto mb-3 h-10 w-10 opacity-30" />
                  <p className="font-medium">No missing pet listings found</p>
                  <p className="mt-1 text-sm">We hope it stays that way!</p>
                </div>
              )}
            </TabsContent>

            {/* Inbox Tab */}
            <TabsContent value="inbox">
              <Suspense fallback={<div className="py-16 text-center text-muted-foreground">Loading inbox...</div>}>
                <InboxView />
              </Suspense>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;