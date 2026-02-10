import { useState, useEffect } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("You have been logged out.", {
        style: {
          background: "#fff",
          color: "#5CA28F",
          fontWeight: "bold",
        },
      });
      navigate("/");
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("Failed to log out.", {
        style: {
          background: "#E53E3E",
          color: "#fff",
          fontWeight: "bold",
        },
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">MyPet360</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Find a Vet
          </Link>
          <Link to="/pet-food" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Find Pet Food
          </Link>
          <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Emergency
          </Link>
          <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          {user && (
            <Link to="/dashboard" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              Dashboard
            </Link>
          )}
        </nav>

        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{user.displayName || user.email}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground">
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign Out</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors inline-block text-center">
            Get started
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
