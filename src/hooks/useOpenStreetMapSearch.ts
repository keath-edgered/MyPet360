import { useState, useEffect } from 'react';

interface VetSearchResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  image: string;
  rating: number;
  reviews: number;
  distance: string;
  isOpen: boolean;
  specialties: string[];
}

interface UseOpenStreetMapSearchOptions {
  location: string;
  query: string;
}

interface UseOpenStreetMapSearchResult {
  data: VetSearchResult[];
  loading: boolean;
  error: string | null;
}

const localVetsDatabase: VetSearchResult[] = [
  {
    id: '1',
    name: "Sydney Animal Hospital",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b08?w=600&h=450&fit=crop",
    rating: 4.9,
    reviews: 312,
    address: "123 George St, Sydney NSW 2000",
    distance: "2.1 km",
    isOpen: true,
    specialties: ["Dogs", "Cats", "Surgery"],
    latitude: -33.8688,
    longitude: 151.2093,
  },
  {
    id: '2',
    name: "Parramatta Pet Clinic",
    image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&h=450&fit=crop",
    rating: 4.7,
    reviews: 245,
    address: "456 Church St, Parramatta NSW 2150",
    distance: "18.5 km",
    isOpen: true,
    specialties: ["Emergency", "Vaccinations"],
    latitude: -33.8171,
    longitude: 151.0939,
  },
  {
    id: '4',
    name: "Brisbane Vet Clinic",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=450&fit=crop",
    rating: 4.7,
    reviews: 189,
    address: "78 Queen St, Brisbane QLD 4000",
    distance: "1.8 km",
    isOpen: false,
    specialties: ["Dental", "Vaccinations"],
    latitude: -27.4710,
    longitude: 153.0234,
  },
  {
    id: '5',
    name: "Perth Animal Wellness",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=450&fit=crop",
    rating: 4.9,
    reviews: 421,
    address: "12 Hay St, Perth WA 6000",
    distance: "4.2 km",
    isOpen: true,
    specialties: ["Rehabilitation", "Nutrition"],
    latitude: -31.9454,
    longitude: 115.8604,
  },
  {
    id: '6',
    name: "Adelaide Veterinary Center",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b08?w=600&h=450&fit=crop",
    rating: 4.6,
    reviews: 178,
    address: "89 King William St, Adelaide SA 5000",
    distance: "2.8 km",
    isOpen: true,
    specialties: ["Surgery", "Cardiology"],
    latitude: -34.6052,
    longitude: 138.6010,
  },
  {
    id: '7',
    name: "Richmond Vet Clinic",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=450&fit=crop",
    rating: 4.8,
    reviews: 320,
    address: "123 Swan St, Richmond VIC 3121",
    distance: "5 km",
    isOpen: true,
    specialties: ["Dental", "Wellness Exams"],
    latitude: -37.8248,
    longitude: 144.9988,
  },
  {
    id: '8',
    name: "St Kilda Animal Hospital",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b08?w=600&h=450&fit=crop",
    rating: 4.7,
    reviews: 210,
    address: "78 Acland St, St Kilda VIC 3182",
    distance: "8 km",
    isOpen: false,
    specialties: ["Surgery", "Exotic Pets"],
    latitude: -37.8675,
    longitude: 144.9772,
  },
  {
    id: '9',
    name: "Fitzroy Veterinary Hospital",
    image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&h=450&fit=crop",
    rating: 4.9,
    reviews: 450,
    address: "22 Johnston St, Fitzroy VIC 3065",
    distance: "3 km",
    isOpen: true,
    specialties: ["Emergency", "Internal Medicine"],
    latitude: -37.7995,
    longitude: 144.9793,
  },
  {
    id: '10',
    name: "North Melbourne Vet Clinic",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=450&fit=crop",
    rating: 4.6,
    reviews: 180,
    address: "35 Flemington Rd, North Melbourne VIC 3051",
    distance: "2.5 km",
    isOpen: true,
    specialties: ["Vaccinations", "Nutrition"],
    latitude: -37.8041,
    longitude: 144.9521,
  },
  {
    id: '11',
    name: "South Yarra Animal Hospital",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b08?w=600&h=450&fit=crop",
    rating: 4.8,
    reviews: 390,
    address: "10 Toorak Rd, South Yarra VIC 3141",
    distance: "6 km",
    isOpen: true,
    specialties: ["Cardiology", "Dermatology"],
    latitude: -37.8386,
    longitude: 144.9826,
  },
];

const useOpenStreetMapSearch = ({ location, query }: UseOpenStreetMapSearchOptions): UseOpenStreetMapSearchResult => {
  const [data, setData] = useState<VetSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Retry helper for Overpass API with exponential backoff
  const fetchWithRetry = async (
    overpassQuery: string,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<any> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const overpassUrl = `https://overpass-api.de/api/interpreter`;
        const response = await fetch(overpassUrl, {
          method: 'POST',
          body: overpassQuery,
          headers: { 'Content-Type': 'text/plain' }
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            return await response.json();
          } else {
            const text = await response.text();
            return JSON.parse(text);
          }
        }

        // If 504, wait and retry
        if (response.status === 504) {
          if (attempt < maxRetries - 1) {
            const waitTime = delayMs * Math.pow(2, attempt); // exponential backoff
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          throw new Error('Overpass API temporarily unavailable (504). Please try again in a few moments.');
        }

        // Other errors
        throw new Error(`Overpass API error ${response.status}`);
      } catch (e: any) {
        if (attempt === maxRetries - 1) {
          throw e;
        }
        const waitTime = delayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  };

  // Helper: geocode a place and query Overpass for veterinary clinics inside the bbox
  const fetchVetsForLocation = async (loc: string, q?: string): Promise<VetSearchResult[]> => {
    try {
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc)}&format=json&countrycodes=au&limit=1`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();
      if (!geocodeData || geocodeData.length === 0) return [];

      const geo0 = geocodeData[0];
      let bbox: string;
      if (geo0.boundingbox && geo0.boundingbox.length === 4) {
        const south = parseFloat(geo0.boundingbox[0]);
        const north = parseFloat(geo0.boundingbox[1]);
        const west = parseFloat(geo0.boundingbox[2]);
        const east = parseFloat(geo0.boundingbox[3]);
        bbox = `${south},${west},${north},${east}`;
      } else {
        const latNum = parseFloat(geo0.lat);
        const lonNum = parseFloat(geo0.lon);
        const delta = 0.08;
        bbox = `${latNum - delta},${lonNum - delta},${latNum + delta},${lonNum + delta}`;
      }

      // Build Overpass query
      let overpassQuery = `[out:json];(node["amenity"="veterinary"](${bbox});way["amenity"="veterinary"](${bbox});`;
      if (q) {
        const serviceKeywords = q.toLowerCase();
        if (serviceKeywords.includes('emergency')) {
          overpassQuery += `node["emergency:veterinary"="yes"](${bbox});way["emergency:veterinary"="yes"](${bbox});`;
        }
        if (serviceKeywords.includes('surgery')) {
          overpassQuery += `node["veterinary:surgery"="yes"](${bbox});way["veterinary:surgery"="yes"](${bbox});`;
        }
        if (serviceKeywords.includes('dental')) {
          overpassQuery += `node["veterinary:dental"="yes"](${bbox});way["veterinary:dental"="yes"](${bbox});`;
        }
        if (serviceKeywords.includes('exotic')) {
          overpassQuery += `node["veterinary:exotic"="yes"](${bbox});way["veterinary:exotic"="yes"](${bbox});`;
        }
        if (serviceKeywords.includes('vaccination') || serviceKeywords.includes('vaccine')) {
          overpassQuery += `node["veterinary:vaccination"="yes"](${bbox});way["veterinary:vaccination"="yes"](${bbox});`;
        }
      }
      overpassQuery += `);out center;`;

      // Use retry helper for Overpass API call
      const overpassData = await fetchWithRetry(overpassQuery);

      const clinics: VetSearchResult[] = (overpassData.elements || [])
        .filter((el: any) => (el.lat || (el.center && el.center.lat)) && (el.lon || (el.center && el.center.lon)))
        .slice(0, 20)
        .map((element: any, index: number) => {
          const lat = element.lat || element.center?.lat;
          const lon = element.lon || element.center?.lon;
          const name = element.tags?.name || `Veterinary Clinic ${index + 1}`;
          const address = [element.tags?.['addr:street'], element.tags?.['addr:city'] || element.tags?.['addr:town'], element.tags?.['addr:postcode'], element.tags?.['addr:country']].filter(Boolean).join(', ') || 'Address not available';
          const specialties = new Set<string>(['General Care']);
          if (element.tags?.['veterinary:surgery'] === 'yes') specialties.add('Surgery');
          if (element.tags?.['emergency:veterinary'] === 'yes') specialties.add('Emergency');
          if (element.tags?.['veterinary:dental'] === 'yes') specialties.add('Dental');
          if (element.tags?.['veterinary:exotic'] === 'yes') specialties.add('Exotic Pets');
          if (element.tags?.['veterinary:vaccination'] === 'yes') specialties.add('Vaccinations');

          return {
            id: `osm-${element.id}`,
            name,
            address,
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
            image: "https://images.unsplash.com/photo-1629909613654-28e377c37b08?w=600&h=450&fit=crop",
            rating: 4.5 + Math.random() * 0.5,
            reviews: Math.floor(50 + Math.random() * 400),
            distance: `${(Math.random() * 10).toFixed(1)} km`,
            isOpen: Math.random() > 0.2,
            specialties: Array.from(specialties),
          } as VetSearchResult;
        });

      return clinics;
    } catch (e) {
      return [];
    }
  };
  useEffect(() => {
    let mounted = true;
    const searchVets = async () => {
      if (!location && !query) {
        setData([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // If query provided (no location), use OpenStreetMap search
        if (!location && query) {
          const clinics = await fetchVetsForLocation(query, query);
          if (mounted) {
            setData(clinics);
          }
          return;
        }

        // Step 1: Check if location is in coordinate format (lat, lon)
        let bbox: string;
        const coordinateMatch = location.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
        
        if (coordinateMatch) {
          // User provided coordinates (from geolocation)
          const latNum = parseFloat(coordinateMatch[1]);
          const lonNum = parseFloat(coordinateMatch[2]);
          const delta = 0.08; // ~8km radius
          bbox = `${latNum - delta},${lonNum - delta},${latNum + delta},${lonNum + delta}`;
        } else {
          // Step 1: Geocode the location to get coordinates using Nominatim
          const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&countrycodes=au&limit=1`;
          const geocodeResponse = await fetch(geocodeUrl);
          const geocodeData = await geocodeResponse.json();

          if (!geocodeData || geocodeData.length === 0) {
            throw new Error(`Could not find location "${location}". Please check the postcode or location name.`);
          }

          const geo0 = geocodeData[0];
          // Use Nominatim boundingbox when available for city/place searches (south, north, west, east)
          if (geo0.boundingbox && geo0.boundingbox.length === 4) {
            const south = parseFloat(geo0.boundingbox[0]);
            const north = parseFloat(geo0.boundingbox[1]);
            const west = parseFloat(geo0.boundingbox[2]);
            const east = parseFloat(geo0.boundingbox[3]);
            bbox = `${south},${west},${north},${east}`;
          } else {
            const latNum = parseFloat(geo0.lat);
            const lonNum = parseFloat(geo0.lon);
            const delta = 0.08;
            bbox = `${latNum - delta},${lonNum - delta},${latNum + delta},${lonNum + delta}`;
          }
        }

        // Step 2: Build Overpass query with service filter
        let overpassQuery = `[out:json];(node["amenity"="veterinary"](${bbox});way["amenity"="veterinary"](${bbox});`;
        
        // Add optional service/specialty filters based on query
        if (query) {
          const serviceKeywords = query.toLowerCase();
          
          if (serviceKeywords.includes('emergency')) {
            overpassQuery += `node["emergency:veterinary"="yes"](${bbox});way["emergency:veterinary"="yes"](${bbox});`;
          }
          if (serviceKeywords.includes('surgery')) {
            overpassQuery += `node["veterinary:surgery"="yes"](${bbox});way["veterinary:surgery"="yes"](${bbox});`;
          }
          if (serviceKeywords.includes('dental')) {
            overpassQuery += `node["veterinary:dental"="yes"](${bbox});way["veterinary:dental"="yes"](${bbox});`;
          }
          if (serviceKeywords.includes('exotic')) {
            overpassQuery += `node["veterinary:exotic"="yes"](${bbox});way["veterinary:exotic"="yes"](${bbox});`;
          }
          if (serviceKeywords.includes('vaccination') || serviceKeywords.includes('vaccine')) {
            overpassQuery += `node["veterinary:vaccination"="yes"](${bbox});way["veterinary:vaccination"="yes"](${bbox});`;
          }
        }
        
        overpassQuery += `);out center;`;

        // Use retry helper for Overpass API call
        const overpassData = await fetchWithRetry(overpassQuery);

        // Step 3: Convert Overpass results to our format
        const clinics: VetSearchResult[] = await Promise.all(
          overpassData.elements
            .filter((element: any) => element.lat && element.lon)
            .slice(0, 20)
            .map(async (element: any, index: number) => {
              const name = element.tags?.name || `Veterinary Clinic ${index + 1}`;
              const address = [
                element.tags?.["addr:street"],
                element.tags?.["addr:city"] || element.tags?.["addr:town"],
                element.tags?.["addr:postcode"],
                element.tags?.["addr:country"] || "Australia"
              ]
                .filter(Boolean)
                .join(", ") || "Address not available";

              let finalLat = element.lat;
              let finalLon = element.lon;
              
              try {
                const searchAddr = `${name}, ${element.tags?.["addr:city"] || element.tags?.["addr:town"] || location}`;
                const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchAddr)}&format=json&countrycodes=au&limit=1`;
                const nominatimResponse = await fetch(nominatimUrl);
                const nominatimData = await nominatimResponse.json();
                
                if (nominatimData && nominatimData.length > 0) {
                  finalLat = parseFloat(nominatimData[0].lat);
                  finalLon = parseFloat(nominatimData[0].lon);
                }
              } catch (e) {
                // keep original coords
              }

              const specialties = new Set<string>(['General Care']);
              if (element.tags?.["veterinary:surgery"] === "yes") specialties.add('Surgery');
              if (element.tags?.["emergency:veterinary"] === "yes") specialties.add('Emergency');
              if (element.tags?.["veterinary:dental"] === "yes") specialties.add('Dental');
              if (element.tags?.["veterinary:exotic"] === "yes") specialties.add('Exotic Pets');
              if (element.tags?.["veterinary:vaccination"] === "yes") specialties.add('Vaccinations');
              
              return {
                id: `osm-${element.id}`,
                name,
                address,
                latitude: finalLat,
                longitude: finalLon,
                image: "https://images.unsplash.com/photo-1629909613654-28e377c37b08?w=600&h=450&fit=crop",
                rating: 4.5 + Math.random() * 0.5,
                reviews: Math.floor(50 + Math.random() * 400),
                distance: `${(Math.random() * 10).toFixed(1)} km`,
                isOpen: Math.random() > 0.2,
                specialties: Array.from(specialties),
              };
            })
        );

        if (mounted) {
          setData(clinics);
        }
      } catch (e: any) {
        if (mounted) {
          setError(e.message || 'Unable to fetch veterinary clinics. Please try again later.');
          setData([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    searchVets();

    return () => {
      mounted = false;
    };
  }, [location, query]);

  return { data, loading, error };
};

export default useOpenStreetMapSearch;
