import { useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { PawPrint, Plus, MessageSquare, LogOut, MapPin, Clock, ChevronRight, User, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const InboxView = lazy(() => import("@/pages/InboxView"));

const mockMissingPets = [
  {
    id: 1,
    name: "Buddy",
    type: "Dog",
    breed: "Golden Retriever",
    lastSeen: "Park Avenue, Downtown",
    date: "Feb 5, 2026",
    status: "missing",
  },
  {
    id: 2,
    name: "Whiskers",
    type: "Cat",
    breed: "Tabby",
    lastSeen: "Elm Street, Suburb",
    date: "Feb 3, 2026",
    status: "missing",
  },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("pets");
  // Unread count will be handled within InboxView. It can be brought back here later if needed.

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">
              MyPet<span className="text-primary">360</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
              <User className="h-4 w-4" />
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-8">
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
            <TabsContent value="pets" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {mockMissingPets.length} active listing{mockMissingPets.length !== 1 && "s"}
                </p>
                <Button size="sm" className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  Report Missing Pet
                </Button>
              </div>
              {mockMissingPets.map((pet, i) => (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                >
                  <Card className="transition-all hover:-translate-y-0.5 hover:card-shadow-hover">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                        <PawPrint className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-card-foreground">{pet.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {pet.type} · {pet.breed}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {pet.lastSeen}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {pet.date}
                          </span>
                        </div>
                      </div>
                      <Badge className="shrink-0 rounded-full bg-destructive/10 text-destructive">
                        Missing
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {mockMissingPets.length === 0 && (
                <div className="py-16 text-center text-muted-foreground">
                  <PawPrint className="mx-auto mb-3 h-10 w-10 opacity-30" />
                  <p className="font-medium">No missing pet listings</p>
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