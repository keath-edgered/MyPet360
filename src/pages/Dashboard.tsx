import { useState, lazy, Suspense, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PawPrint, Plus, MessageSquare, MapPin, Clock, Inbox, Trash2, FilePenLine, MoreHorizontal, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  updateDoc,
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

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const heartSvgForMask = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="black">
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>`;

// btoa is a browser API, this will work in the client-side environment.
const heartMaskUrl = `url('data:image/svg+xml;base64,${typeof window !== 'undefined' ? window.btoa(heartSvgForMask) : ''}')`;

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
  status: 'missing' | 'reunited';
  createdAt: any; // Firestore Timestamp
  imageUrl?: string;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("pets");
  const navigate = useNavigate();
  const [missingPets, setMissingPets] = useState<MissingPet[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null); // To manage markers easily
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [petToDelete, setPetToDelete] = useState<MissingPet | null>(null);

  const handleToggleStatus = async (petId: string, currentStatus: 'missing' | 'reunited') => {
    const newStatus = currentStatus === 'missing' ? 'reunited' : 'missing';
    try {
      await updateDoc(doc(db, "missing_pets", petId), {
        status: newStatus
      });
      toast.success(`Pet listing updated to "${newStatus}".`);
    } catch (error) {
      console.error("Error updating pet status:", error);
      toast.error("Failed to update pet status.");
    }
  };

  const handleZoomToPet = (pet: MissingPet) => {
    if (mapRef.current && pet.location) {
      mapRef.current.setView([pet.location.latitude, pet.location.longitude], 15);
      const marker = markersRef.current[pet.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

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

  // Fetch unread messages count for the inbox tab
  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, 'ChatApp'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let count = 0;
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.lastMessage && data.lastMessage.senderId !== currentUser.uid && !(data.lastMessage.readBy || []).includes(currentUser.uid)) {
          count++;
        }
      });
      setUnreadCount(count);
    }, (error) => {
      console.error("Error fetching unread messages count:", error);
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
      markersRef.current = {};

      const bounds = L.latLngBounds([]);
      missingPets.forEach(pet => {
        if (pet.location?.latitude && pet.location?.longitude) {
          let icon;
          if (pet.imageUrl) {
            const borderColor = pet.status === 'reunited' ? '#22c55e' : '#ef4444'; // green-500 and red-500
            icon = L.divIcon({
              className: 'custom-pet-marker',
              html: `
                <div style="
                  width: 48px;
                  height: 48px;
                  background-color: ${borderColor};
                  -webkit-mask-image: ${heartMaskUrl};
                  mask-image: ${heartMaskUrl};
                  -webkit-mask-size: contain;
                  mask-size: contain;
                  -webkit-mask-repeat: no-repeat;
                  mask-repeat: no-repeat;
                  -webkit-mask-position: center;
                  mask-position: center;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                ">
                  <div style="
                    width: 40px;
                    height: 40px;
                    background-image: url(${pet.imageUrl});
                    background-size: cover;
                    background-position: center;
                    -webkit-mask-image: ${heartMaskUrl};
                    mask-image: ${heartMaskUrl};
                    -webkit-mask-size: contain;
                    mask-size: contain;
                    -webkit-mask-repeat: no-repeat;
                    mask-repeat: no-repeat;
                    -webkit-mask-position: center;
                    mask-position: center;
                  "></div>
                </div>`,
              iconSize: [48, 48],
              iconAnchor: [24, 48],
              popupAnchor: [0, -48]
            });
          } else {
            icon = pet.status === 'reunited' ? greenIcon : redIcon;
          }
          const popupContent = `
            <div class="p-1" style="min-width: 200px; max-width: 250px;">
              ${pet.imageUrl ? `<img src="${pet.imageUrl}" alt="${pet.petName}" class="w-full h-auto object-contain rounded-md mb-2" style="max-height: 200px;" />` : ''}
              <h3 class="font-bold text-sm">${pet.petName} (${pet.petType})</h3>
              ${pet.status === 'reunited' ?
                `<p class="text-xs text-green-600 font-bold mt-1">Status: Reunited</p>
                 <p class="text-xs text-gray-600">Location: ${pet.lastSeenLocationName}</p>` :
                `<p class="text-xs text-gray-600 mt-1">Last seen: ${pet.lastSeenLocationName}</p>`
              }
              <p class="text-xs text-gray-600">Owner: ${pet.ownerName}</p>
              <div class="mt-2 flex items-center gap-4">
                ${pet.status !== 'reunited' ? `<button id="contact-owner-${pet.id}" class="text-xs text-blue-600 hover:underline">Contact Owner</button>` : ''}
                <a href="https://www.google.com/maps?q=${pet.location.latitude},${pet.location.longitude}" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-600 hover:underline">View on Google Maps →</a>
              </div>
            </div>
          `;
          
          const marker = L.marker([pet.location.latitude, pet.location.longitude], { icon })
            .bindPopup(popupContent)
            .bindTooltip(`${pet.petName} - <span class="capitalize font-semibold ${pet.status === 'reunited' ? 'text-green-600' : 'text-red-600'}">${pet.status}</span>`);

          marker.on('mouseover', () => {
            marker.openPopup();
          });

          marker.on('popupopen', () => {
            const contactButton = document.getElementById(`contact-owner-${pet.id}`);
            if (contactButton) {
              contactButton.onclick = () => handlePetClick(pet);
            }
          });

          markersRef.current[pet.id] = marker;
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
    // If pet is found, just center map on it and show a message
    if (pet.status === 'reunited') {
      toast.info(`${pet.petName} has already been reunited.`);
      if (mapRef.current && pet.location) {
        mapRef.current.setView([pet.location.latitude, pet.location.longitude], 15);
        setActiveTab("pets");
      }
      return;
    }

    // Use the currentUser from state, which is updated by onAuthStateChanged
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
      const userDisplayName = currentUser.displayName || (currentUser.email || '').split('@')[0] || 'User';
      const userInitials = userDisplayName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
      const ownerDisplayName = pet.ownerName || 'Owner';
      const ownerInitials = ownerDisplayName.split(' ').map(n => n[0]).join('').toUpperCase() || 'O';

      await addDoc(chatsRef, {
        participants: [currentUser.uid, pet.ownerId],
        participantInfo: {
          [currentUser.uid]: {
            name: userDisplayName,
            initials: userInitials,
          },
          [pet.ownerId]: {
            name: ownerDisplayName,
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
              <TabsTrigger value="pets" className="gap-2 text-black data-[state=active]:text-[#3AA893]">
                <PawPrint className="h-4 w-4" />
                Missing Pets
              </TabsTrigger>
              <TabsTrigger value="inbox" className="gap-2 text-black data-[state=active]:text-[#3AA893]">
                <Inbox className="h-4 w-4" />
                Inbox
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 flex items-center justify-center p-0 rounded-full text-xs font-bold">
                    {unreadCount}
                  </Badge>
                )}
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
                  onClick={() => handleZoomToPet(pet)}
                >
                  <Card className="cursor-pointer transition-all hover:-translate-y-0.5 hover:card-shadow-hover">
                    <CardContent className="flex items-center gap-4 p-5">
                      {pet.imageUrl ? (
                        <img src={pet.imageUrl} alt={pet.petName} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                          <PawPrint className="h-6 w-6" />
                        </div>
                      )}
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
                        <Badge className={cn("shrink-0 rounded-full capitalize", pet.status === 'reunited' ? 'bg-green-100 text-green-800' : 'bg-destructive/10 text-destructive')}>
                          {pet.status}
                        </Badge>
                        {currentUser?.uid === pet.ownerId && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/report-missing-pet/${pet.id}`)}>
                                  <FilePenLine className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                {pet.status === 'missing' ? (
                                  <DropdownMenuItem onClick={() => handleToggleStatus(pet.id, pet.status)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    <span>Mark as Found</span>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleToggleStatus(pet.id, pet.status)}>
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    <span>Mark as Missing</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setPetToDelete(pet)} className="text-destructive focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
        <AlertDialog open={!!petToDelete} onOpenChange={(open) => { if (!open) setPetToDelete(null); }}>
          <AlertDialogContent className="z-[1100]">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the listing for <strong>{petToDelete?.petName}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  if (petToDelete) {
                    await handleDelete(petToDelete.id);
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default Dashboard;