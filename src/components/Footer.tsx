import { Link } from "react-router-dom";
import petPawsLogo from "@/components/images/petpawsLogo.png";

const Footer = () => {
  return (
    <footer className="py-12 bg-foreground text-background/80">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2 text-background hover:text-background/80 transition-colors">
            <img src={petPawsLogo} alt="MyPet360 Logo" className="h-10 w-auto" />
            <span className="font-semibold text-lg">MyPet360</span>
          </Link>
          
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
