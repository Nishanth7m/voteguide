import React, { useEffect, useRef, useState } from "react";
import { MapPin as MapPinIcon, Search as SearchIcon, Navigation as NavigationIcon, ExternalLink as ExternalLinkIcon } from "lucide-react";
import { useTranslation, useAutoTranslate } from "../hooks/useApp";

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface Location {
  name: string;
  address: string;
  hours: string;
  lat: number;
  lng: number;
}

const PollingLocator: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { T } = useTranslation();

  useAutoTranslate([
    "Find Your Polling Station",
    "Enter your address or ZIP code to find where you can vote.",
    "Enter address or ZIP...",
    "Searching...",
    "Search",
    "Scanning for locations...",
    "Your search results will appear here.",
    "Get Directions",
    "Location not found.",
    "Permission to access location was denied.",
    "Google Maps API Key is missing. Please check your configuration."
  ]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError(T("Google Maps API Key is missing. Please check your configuration."));
      return;
    }

    if (!window.google) {
      // Check if script is already added
      const existingScript = document.getElementById("google-maps-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (window.google) initMap();
        };
        document.head.appendChild(script);
      } else {
        // Script exists, add listener to onload if not already loaded
        existingScript.addEventListener('load', () => {
          if (window.google) initMap();
        });
        // If it's already loaded but window.google is still being initialized
        const checkInterval = setInterval(() => {
          if (window.google) {
            initMap();
            clearInterval(checkInterval);
          }
        }, 100);
        setTimeout(() => clearInterval(checkInterval), 5000); // safety timeout
      }
    } else {
      initMap();
    }
  }, []);

  const initMap = () => {
    if (!mapRef.current) return;
    const google = window.google;
    const newMap = new google.maps.Map(mapRef.current, {
      center: { lat: 38.8977, lng: -77.0365 }, // DC default
      zoom: 12,
      styles: [
        { "featureType": "all", "elementType": "all", "stylers": [{ "saturation": -100 }, { "gamma": 0.5 }] }
      ]
    });
    setMap(newMap);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query || !map) return;
    setLoading(true);
    setError(null);

    const google = window.google;
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: query }, (results: any, status: any) => {
      if (status === "OK") {
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(14);
        findNearby(location);
      } else {
        setError(T("Location not found."));
        setLoading(false);
      }
    });
  };

  const findNearby = (location: any) => {
    const google = window.google;
    const service = new google.maps.places.PlacesService(map);
    
    const request = {
      location: location,
      radius: "5000",
      query: "polling station election office"
    };

    service.textSearch(request, (results: any, status: any) => {
      setLoading(false);
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        const transformed = results.map((place: any) => ({
          name: place.name,
          address: place.formatted_address,
          hours: place.opening_hours?.isOpen() ? "Currently Open" : "See Details",
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }));
        setResults(transformed);
        
        // Add markers
        transformed.forEach((loc: Location) => {
          new google.maps.Marker({
            position: { lat: loc.lat, lng: loc.lng },
            map: map,
            title: loc.name,
            animation: google.maps.Animation.DROP
          });
        });
      }
    });
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.setCenter(coords);
        map.setZoom(14);
        findNearby(coords);
      }, () => {
        setError(T("Permission to access location was denied."));
        setLoading(false);
      });
    }
  };

  return (
    <section id="polling-locator" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">{T("Find Your Polling Station")}</h2>
            <p className="text-gray-600">{T("Enter your address or ZIP code to find where you can vote.")}</p>
          </div>
          
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 min-w-[280px]">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder={T("Enter address or ZIP...")}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white font-medium"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="bg-[#1a56db] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center min-w-[120px]"
            >
              {loading ? T("Searching...") : T("Search")}
            </button>
            <button 
              type="button"
              onClick={useCurrentLocation}
              className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
              aria-label="Use my current location"
            >
              <NavigationIcon size={20} className="text-blue-600" />
            </button>
          </form>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3">
                <span className="font-medium">{error}</span>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 relative h-[500px] rounded-2xl overflow-hidden shadow-xl border-4 border-white">
            <div ref={mapRef} className="w-full h-full" />
            {loading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="font-bold text-blue-900">{T("Scanning for locations...")}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
            {results.length === 0 && !loading && !error && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <MapPinIcon size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">{T("Your search results will appear here.")}</p>
              </div>
            )}

            {results.map((loc, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-transparent hover:border-blue-200 shadow-sm transition-all group">
                <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">{loc.name}</h4>
                <p className="text-sm text-gray-500 mb-4">{loc.address}</p>
                <div className="flex items-center justify-between">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
                  >
                    {T("Get Directions")}
                    <ExternalLinkIcon size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PollingLocator;
