import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Vet } from '@/types';

// Fix for default marker icons in leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GoogleMapComponentProps {
  vets: Vet[];
  location?: string;
  zoom?: number;
  selectedVetId?: string;
  onSelectVet?: (id: string) => void;
}

const GoogleMapComponent = ({ vets, location = '', zoom = 12, selectedVetId, onSelectVet }: GoogleMapComponentProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not already initialized
    if (!mapRef.current) {
      // Default center (Australia)
      const defaultCenter: [number, number] = [-25.2744, 133.7751];
      const initialCenter = vets.length > 0 
        ? [vets[0].latitude, vets[0].longitude] as [number, number]
        : defaultCenter;

      mapRef.current = L.map(mapContainerRef.current).setView(initialCenter, zoom);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    // Clear existing markers and our refs
    Object.values(markersRef.current).forEach((m) => {
      if (mapRef.current && mapRef.current.hasLayer(m)) mapRef.current.removeLayer(m);
    });
    markersRef.current = {};

    // Add markers for each vet
    vets.forEach((vet) => {
      if (vet.latitude && vet.longitude) {
        const marker = L.marker([vet.latitude, vet.longitude]).addTo(mapRef.current!);

        // when marker is clicked, notify parent to select the card
        marker.on('click', () => {
          if (onSelectVet) onSelectVet(vet.id);
        });

        marker.bindPopup(`
          <div class="p-3 min-w-[250px]">
            <h3 class="font-bold text-sm">${vet.name}</h3>
            <p class="text-xs text-gray-600 mt-1">${vet.address}</p>
            <div class="flex items-center gap-1 mt-2">
              <span class="text-yellow-500">★</span>
              <span class="text-xs font-medium">${vet.rating.toFixed(1)}</span>
              <span class="text-xs text-gray-500">(${vet.reviews} reviews)</span>
            </div>
            ${vet.distance ? `<p class="text-xs text-gray-500 mt-1">${vet.distance} away</p>` : ''}
            <div class="flex flex-wrap gap-1 mt-2">
              ${vet.specialties.map(spec => `<span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">${spec}</span>`).join('')}
            </div>
            <a href="https://www.google.com/maps?q=${vet.latitude},${vet.longitude}" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-600 hover:underline mt-2 block">
              View on Google Maps →
            </a>
          </div>
        `);
        
        markersRef.current[vet.id] = marker;
      }
    });

    // Handle selected vet - pan to it and open popup
    if (selectedVetId && markersRef.current[selectedVetId]) {
      const selectedMarker = markersRef.current[selectedVetId];
      const latlng = selectedMarker.getLatLng();
      mapRef.current!.setView(latlng, 16, { animate: true });
      selectedMarker.openPopup();
    }

    // Fit bounds to all markers if available
    if (vets.length > 0) {
      const bounds = L.latLngBounds(
        vets
          .filter(v => v.latitude && v.longitude)
          .map(v => [v.latitude, v.longitude] as [number, number])
      );
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [vets, zoom, selectedVetId]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default GoogleMapComponent;
