import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

interface MapComponentProps {
  vets: Vet[];
  center?: [number, number];
  zoom?: number;
}

const MapComponent = ({ 
  vets, 
  center = [-25.2744, 133.7751], 
  zoom = 4 
}: MapComponentProps) => {
  return (
    <div style={{ height: '500px', width: '100%' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {vets.map((vet) => {
          // Make sure vet has coordinates
          if (!vet.latitude || !vet.longitude) return null;
          
          return (
            <Marker key={vet.id} position={[vet.latitude, vet.longitude]}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{vet.name}</h3>
                  <p className="text-sm">{vet.address}</p>
                  <p className="text-sm">★ {vet.rating} ({vet.reviews} reviews)</p>
                  <p className="text-sm">{vet.distance} away</p>
                  <div className="flex gap-1 mt-2">
                    {vet.specialties.map((spec) => (
                      <span key={spec} className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;