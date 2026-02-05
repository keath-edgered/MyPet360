import MapComponent from '@/components/MapComponent';

const TestMap = () => {
  const testVets = [
    {
      id: '1',
      name: "Test Vet",
      address: "123 Test St",
      latitude: -33.8688,
      longitude: 151.2093,
      rating: 4.5,
      reviews: 100,
      distance: "5 km",
      specialties: ["Test"],
    }
  ];

  return (
    <div className="w-full h-screen">
      <h1 className="p-4">Map Test</h1>
      <div className="h-[500px] p-4">
        <MapComponent vets={testVets} center={[-33.8688, 151.2093]} zoom={12} />
      </div>
    </div>
  );
};

export default TestMap;
