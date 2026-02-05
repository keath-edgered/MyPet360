import { MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-foreground text-background/80">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <a href="/" className="flex items-center gap-2 text-background hover:text-background/80 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">MyPet360</span>
          </a>
          
          <nav className="flex items-center gap-8">
            <a href="#" className="text-sm hover:text-background transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm hover:text-background transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm hover:text-background transition-colors">
              Contact
            </a>
          </nav>
          
          <p className="text-sm">
            © 2025 MyPet360 Australia
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
