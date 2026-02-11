import { useState, useEffect } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { toast } from "sonner";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import petPawsLogo from "@/components/images/petpawsLogo.png";

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
        <Link to="/" className="flex items-center gap-2 text-foreground transition-colors hover:text-[#3AA893]">
          <img src={petPawsLogo} alt="MyPet360 Logo" className="h-10 w-auto" />
          <span className="font-semibold text-lg">MyPet360</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={({isActive}) => `text-sm transition-colors hover:text-[#3AA893] ${isActive ? 'text-[#3AA893]' : 'text-muted-foreground'}`}>
            Find a Vet
          </NavLink>
          <NavLink to="/pet-food" className={({isActive}) => `text-sm transition-colors hover:text-[#3AA893] ${isActive ? 'text-[#3AA893]' : 'text-muted-foreground'}`}>
            Find Pet Food
          </NavLink>
          <NavLink to="#" className="text-sm text-muted-foreground hover:text-[#3AA893] transition-colors">
            Emergency
          </NavLink>
          {!user && (
          <NavLink to="/login" className={({isActive}) => `text-sm transition-colors hover:text-[#3AA893] ${isActive ? 'text-[#3AA893]' : 'text-muted-foreground'}`}>
            Report Missing Pet
          </NavLink>
          )}
          <NavLink to="/about" className={({isActive}) => `text-sm transition-colors hover:text-[#3AA893] ${isActive ? 'text-[#3AA893]' : 'text-muted-foreground'}`}>
            About
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={({isActive}) => isActive
                ? "bg-accent text-accent-foreground px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-accent/90"
                : "text-sm font-medium text-[#F16E32] hover:text-[#F16E32]/70 transition-colors"
            }>
              Dashboard
            </NavLink>
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
