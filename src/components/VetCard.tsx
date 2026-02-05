import { Star, MapPin, Clock } from "lucide-react";

interface VetCardProps {
  name: string;
  image: string;
  rating: number;
  reviews: number;
  address: string;
  distance: string;
  isOpen: boolean;
  specialties: string[];
}

const VetCard = ({ name, image, rating, reviews, address, distance, isOpen, specialties }: VetCardProps) => {
  return (
    <article className="group bg-card rounded-2xl card-shadow overflow-hidden hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground text-lg leading-tight">
            {name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-foreground">{rating}</span>
            <span className="text-sm text-muted-foreground">({reviews})</span>
          </div>
        </div>
        
        <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">{address}</span>
          <span className="shrink-0">· {distance}</span>
        </div>
        
        <div className="mt-3 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            isOpen 
              ? "bg-primary/10 text-primary" 
              : "bg-muted text-muted-foreground"
          }`}>
            <Clock className="w-3 h-3" />
            {isOpen ? "Open now" : "Closed"}
          </span>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {specialties.map((specialty) => (
            <span 
              key={specialty}
              className="px-2.5 py-1 bg-secondary text-secondary-foreground text-xs rounded-lg"
            >
              {specialty}
            </span>
          ))}
        </div>
        
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 block w-full text-center py-3 bg-primary/5 text-primary font-medium rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
        >
          View Profile
        </a>
      </div>
    </article>
  );
};

export default VetCard;
