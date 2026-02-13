import { useSearchParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GoogleMapComponent from '@/components/GoogleMapComponent';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useOpenStreetMapSearch from '@/hooks/useOpenStreetMapSearch';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const location = searchParams.get('location') || '';
  const query = searchParams.get('query') || '';
  const [selectedVetId, setSelectedVetId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!selectedVetId) return;
    const el = cardRefs.current[selectedVetId];
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedVetId]);

  const { data: displayedVets, loading, error } = useOpenStreetMapSearch({ location, query });

  const mapCenter = displayedVets.length > 0
    ? [displayedVets[0].latitude, displayedVets[0].longitude] as [number, number]
    : [-25.2744, 133.7751] as [number, number];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-8">
        <div className="container">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </button>

          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-foreground">Search Results</h1>
            <div className="mt-2 text-muted-foreground">
              {location && <p>Location: <span className="font-medium text-foreground">{location}</span></p>}
              {query && <p>Service: <span className="font-medium text-foreground">{query}</span></p>}
              <p className="mt-2 text-sm">
                {loading && "Searching..."}
                {!loading && !error && `${displayedVets.length} veterinary clinic${displayedVets.length !== 1 ? 's' : ''} found`}
                {!loading && error && ""}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">Searching for veterinary clinics...</p>
              <p className="text-sm text-muted-foreground mt-2">This may take a moment.</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-lg text-red-600">⚠️ {error}</p>
              <p className="text-sm text-muted-foreground mt-2">Try searching with a different postcode or location.</p>
              <button
                onClick={() => navigate('/')}
                className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Another Search
              </button>
            </div>
          ) : displayedVets.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[600px]">
              <div className="lg:col-span-2 h-[300px] lg:h-full">
                <GoogleMapComponent vets={displayedVets} location={location} selectedVetId={selectedVetId} onSelectVet={(id) => setSelectedVetId(id)} />
              </div>

              <div className="lg:col-span-1 lg:overflow-y-auto">
                <div className="space-y-4">
                  {displayedVets.map((vet) => (
                    <div
                      key={vet.id}
                      ref={(el) => (cardRefs.current[vet.id] = el)}
                      onClick={() => setSelectedVetId(vet.id)}
                      className={`cursor-pointer transition-all rounded-lg border-2 ${
                        selectedVetId === vet.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground">{vet.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{vet.address}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm font-medium">{vet.rating}</span>
                          <span className="text-xs text-muted-foreground">({vet.reviews})</span>
                          {vet.isOpen && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Open</span>}
                          {!vet.isOpen && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Closed</span>}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {vet.specialties.slice(0, 2).map((spec) => (
                            <span key={spec} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {spec}
                            </span>
                          ))}
                          {vet.specialties.length > 2 && (
                            <span className="text-xs text-muted-foreground px-2 py-1">
                              +{vet.specialties.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No veterinary clinics found matching your search.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search criteria.</p>
              <button
                onClick={() => navigate('/')}
                className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Another Search
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchResults;
