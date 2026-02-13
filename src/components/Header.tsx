import { useState, useEffect } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { toast } from "sonner";
import { Link, useNavigate, NavLink, useLocation } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import petPawsLogo from "@/components/images/petpawsLogo.png";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleReportMissingClick = () => {
    if (user) {
      navigate('/report-missing-pet');
    } else {
      toast.info("Please log in or sign up to report a missing pet.");
      navigate('/login');
    }
    if (isMenuOpen) setIsMenuOpen(false);
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
          <NavLink to="/emergency" className={({isActive}) => `text-sm transition-colors hover:text-[#3AA893] ${isActive ? 'text-[#3AA893]' : 'text-muted-foreground'}`}>
            Emergency
          </NavLink>
          <button
            onClick={handleReportMissingClick}
            className={cn("text-sm transition-colors hover:text-[#3AA893]", location.pathname === '/report-missing-pet' ? 'text-[#3AA893]' : 'text-muted-foreground')}
          >
            Report Missing Pet
          </button>
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
          <div className="hidden md:flex items-center gap-2">
            <span className="hidden lg:inline text-sm font-medium text-foreground">{user.displayName || user.email}</span>
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
          <Link to="/login" className="hidden md:inline-block px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors text-center">
            Get started
          </Link>
        )}

        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="sr-only">Toggle menu</span>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0.5 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0.5 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-background border-t border-border overflow-hidden"
          >
            <div className="container py-6 flex flex-col items-start gap-4">
              <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `text-base transition-colors hover:text-[#3AA893] ${isActive ? 'text-[#3AA893]' : 'text-foreground'}`}>
                Find a Vet
              </NavLink>
              <NavLink to="/pet-food" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `text-base transition-colors hover:text-[#3AA893] ${isActive ? 'text-[#3AA893]' : 'text-foreground'}`}>
                Find Pet Food
              </NavLink>
              <NavLink to="/emergency" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `text-base transition-colors hover:text-[#3AA893] ${isActive ? 'text-[#3AA893]' : 'text-foreground'}`}>
                Emergency
              </NavLink>
              <button onClick={handleReportMissingClick} className="text-base text-foreground hover:text-[#3AA893] transition-colors">
                Report Missing Pet
              </button>
              <NavLink to="/about" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `text-base transition-colors hover:text-[#3AA893] ${isActive ? 'text-[#3AA893]' : 'text-foreground'}`}>
                About
              </NavLink>

              <div className="w-full h-px bg-border my-2" />

              {user ? (
                <div className="w-full flex flex-col items-start gap-4">
                  <NavLink to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-[#F16E32] hover:text-[#F16E32]/70 transition-colors">
                    Dashboard
                  </NavLink>
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-base text-muted-foreground">
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full px-4 py-3 text-base font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors inline-block text-center">
                  Get started
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
