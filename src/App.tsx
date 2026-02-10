import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

// Import pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SearchResults from "./pages/SearchResults";
import PetFood from "./pages/PetFood"; // This is actually pet food search results
import About from "./pages/About";
import ReportMissingPet from "./pages/ReportMissingPet";
import TestMap from "./pages/TestMap";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <TooltipProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pet-food" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/pet-food-search" element={<PetFood />} />
          <Route path="/about" element={<About />} />
          <Route path="/report-missing-pet" element={<ReportMissingPet />} />
          <Route path="/test-map" element={<TestMap />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;