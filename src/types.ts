export interface Vet {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  rating?: number;
  reviews?: number;
  distance?: string;
  specialties: string[];
}

export default Vet;
