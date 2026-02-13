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

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

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
          <NavLink to="#" className="text-sm text-muted-foreground hover:text-[#3AA893] transition-colors">
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
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
            <span className="sr-only">Open menu</span>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm"
          >
            <div className="container flex items-center justify-between h-16">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-foreground">
                <img src={petPawsLogo} alt="MyPet360 Logo" className="h-10 w-auto" />
                <span className="font-semibold text-lg">MyPet360</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8 flex flex-col items-center gap-6"
            >
              <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `text-lg transition-colors hover:text-[#3AA893] ${isActive ? 'text-[#3AA893]' : 'text-foreground'}`}>
                Find a Vet
              </NavLink>
              <NavLink to="/pet-food" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `text-lg transition-colors hover:text-[#3AA893] ${isActive ? 'text-[#3AA893]' : 'text-foreground'}`}>
                Find Pet Food
              </NavLink>
              <NavLink to="#" onClick={() => setIsMenuOpen(false)} className="text-lg text-foreground hover:text-[#3AA893] transition-colors">
                Emergency
              </NavLink>
              <button onClick={handleReportMissingClick} className="text-lg text-foreground hover:text-[#3AA893] transition-colors">
                Report Missing Pet
              </button>
              <NavLink to="/about" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `text-lg transition-colors hover:text-[#3AA893] ${isActive ? 'text-[#3AA893]' : 'text-foreground'}`}>
                About
              </NavLink>

              <div className="w-4/5 max-w-xs h-px bg-border my-4" />

              {user ? (
                <>
                  <NavLink to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-[#F16E32] hover:text-[#F16E32]/70 transition-colors">
                    Dashboard
                  </NavLink>
                  <Button variant="ghost" onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-lg text-muted-foreground">
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-4/5 max-w-xs px-4 py-3 text-base font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors inline-block text-center">
                  Get started
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
