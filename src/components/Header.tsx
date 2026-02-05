import { MapPin } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">MyPet360</span>
        </a>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Find a Vet
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Find Pet Food
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Emergency
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
        </nav>

        <button className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors">
          List Your Clinic
        </button>
      </div>
    </header>
  );
};

export default Header;
