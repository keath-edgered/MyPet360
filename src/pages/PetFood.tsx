import { useSearchParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GoogleMapComponent from '@/components/GoogleMapComponent';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useOpenStreetMapSearch from '@/hooks/useOpenStreetMapSearch';

const PetFood = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const location = searchParams.get('location') || '';
  const query = searchParams.get('query') || '';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!selectedId) return;
    const el = cardRefs.current[selectedId];
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedId]);

  const { data: items, loading, error } = useOpenStreetMapSearch({ location, query, category: 'petfood' });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 py-8">
        <div className="container">
          <button
            onClick={() => navigate('/pet-food')}
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </button>

          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-foreground">Pet Food Results</h1>
            <div className="mt-2 text-muted-foreground">
              {location && <p>Location: <span className="font-medium text-foreground">{location}</span></p>}
              {query && <p>Product: <span className="font-medium text-foreground">{query}</span></p>}
              <p className="mt-2 text-sm">
                {loading && "Searching..."}
                {!loading && !error && `${items.length} pet food store${items.length !== 1 ? 's' : ''} found`}
                {!loading && error && ""}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">Searching for pet food stores...</p>
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
          ) : items.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
              <div className="lg:col-span-2">
                <GoogleMapComponent vets={items} location={location} selectedVetId={selectedId} onSelectVet={(id) => setSelectedId(id)} />
              </div>

              <div className="lg:col-span-1 overflow-y-auto">
                <div className="space-y-4">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      ref={(el) => (cardRefs.current[it.id] = el)}
                      onClick={() => setSelectedId(it.id)}
                      className={`cursor-pointer transition-all rounded-lg border-2 ${selectedId === it.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    >
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground">{it.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{it.address}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm font-medium">{it.rating}</span>
                          <span className="text-xs text-muted-foreground">({it.reviews})</span>
                          {it.isOpen && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Open</span>}
                          {!it.isOpen && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Closed</span>}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {it.specialties.slice(0, 2).map((spec) => (
                            <span key={spec} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{spec}</span>
                          ))}
                          {it.specialties.length > 2 && (
                            <span className="text-xs text-muted-foreground px-2 py-1">+{it.specialties.length - 2} more</span>
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
              <p className="text-lg text-muted-foreground">No pet food stores found matching your search.</p>
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

export default PetFood;
