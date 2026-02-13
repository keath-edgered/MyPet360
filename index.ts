export interface Vet {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  reviews?: number;
  distance: string;
  specialties: string[];
  isOpen?: boolean;
  image?: string; // Optional as it's not available for all vets (e.g. search results)
}