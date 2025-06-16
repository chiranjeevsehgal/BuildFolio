import { useState, useEffect } from 'react';

// Location Autocomplete using Nominatim (OpenStreetMap)
const LocationAutocomplete = ({ value, onChange, placeholder, hasError }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchLocations = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Focus on cities, towns, and administrative areas
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&featureType=city,town,village,administrative&countrycodes=us,ca,gb,au,de,fr,in,sg,ae,nl,se,no,dk,fi,ch,at,be,ie,it,es,pt,pl,cz,hu,ro,bg,hr,si,sk,lt,lv,ee,lu,mt,cy`
      );
      const data = await response.json();
      
      const formattedSuggestions = data
        .filter(item => {
          // Filter for places that are cities, towns, or administrative areas
          const placeType = item.type;
          return ['city', 'town', 'village', 'municipality', 'administrative'].includes(placeType) ||
                 item.class === 'place' ||
                 item.class === 'boundary';
        })
        .map(item => {
          const address = item.address || {};
          const city = address.city || address.town || address.village || address.municipality || '';
          const state = address.state || address.province || address.region || '';
          const country = address.country || '';
          
          let formatted = '';
          if (city && state && country) {
            formatted = `${city}, ${state}, ${country}`;
          } else if (city && country) {
            formatted = `${city}, ${country}`;
          } else if (state && country) {
            formatted = `${state}, ${country}`;
          } else {
            formatted = item.display_name;
          }
          
          return {
            display_name: item.display_name,
            formatted: formatted,
            type: item.type
          };
        })
        .slice(0, 8); // Limit to 8 suggestions
      
      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value && value.length >= 3) {
        searchLocations(value);
      } else {
        setSuggestions([]);
      }
    }, 600); // Increased debounce to be respectful to free API

    return () => clearTimeout(timeoutId);
  }, [value]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-colors ${
          hasError ? "border-red-500" : "border-slate-300"
        }`}
      />
      
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onMouseDown={() => {
                onChange(suggestion.formatted);
                setShowSuggestions(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-slate-100 focus:bg-slate-100 focus:outline-none border-b border-slate-100 last:border-b-0"
            >
              <div className="text-sm font-medium text-slate-800">
                {suggestion.formatted}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {suggestion.type} • {suggestion.display_name}
              </div>
            </button>
          ))}
        </div>
      )}
      
      {showSuggestions && value.length >= 3 && suggestions.length === 0 && !loading && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg p-3">
          <div className="text-sm text-slate-500 text-center">
            No locations found. Try typing a city name.
          </div>
        </div>
      )}
    </div>
  );
};

// Location Autocomplete using HipoLabs University API
const UniversityAutocomplete = ({ value, onChange, placeholder, hasError, country = '' }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchUniversities = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Try HTTPS first for better compatibility
      let url = `http://universities.hipolabs.com/search?name=${encodeURIComponent(query)}`;
      if (country) {
        url += `&country=${encodeURIComponent(country)}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        cache: 'default'
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      if (!text.trim()) {
        throw new Error('Empty response');
      }

      const data = JSON.parse(text);
      
      if (Array.isArray(data) && data.length > 0) {
        const formattedSuggestions = data
          .filter(university => university.name && university.name.trim()) // Filter out invalid entries
          .slice(0, 12) // Slightly more results
          .map(university => ({
            name: university.name.trim(),
            country: university.country || 'Unknown',
            domain: university.domain || '',
            website: university.web_pages?.[0] || university.website || '',
            display: `${university.name.trim()}${university.country ? `, ${university.country}` : ''}`
          }))
          .sort((a, b) => {
            // Sort by relevance - exact matches first, then starts with query
            const queryLower = query.toLowerCase();
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            
            if (aName === queryLower) return -1;
            if (bName === queryLower) return 1;
            if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
            if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1;
            
            return a.name.localeCompare(b.name);
          });

        setSuggestions(formattedSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('University search timed out');
      } else {
        console.error('Error fetching universities:', error.message);
      }
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value && value.length >= 2) {
        searchUniversities(value);
      } else {
        setSuggestions([]);
        setLoading(false);
      }
    }, 500); // Slightly longer debounce for better UX

    return () => clearTimeout(timeoutId);
  }, [value, country]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    if (showSuggestions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSuggestions]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => {
          if (value.length >= 2 && suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setShowSuggestions(false);
          }
        }}
        placeholder={placeholder}
        className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-colors ${
          hasError ? "border-red-500" : "border-slate-300"
        }`}
        autoComplete="off"
      />
      
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.name}-${index}`}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange(suggestion.name);
                setShowSuggestions(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-slate-100 focus:bg-slate-100 focus:outline-none border-b border-slate-100 last:border-b-0 transition-colors"
            >
              <div className="text-sm font-medium text-slate-800 truncate">
                {suggestion.name}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {suggestion.country}{suggestion.domain ? ` • ${suggestion.domain}` : ''}
              </div>
            </button>
          ))}
        </div>
      )}
      
      {showSuggestions && value.length >= 2 && suggestions.length === 0 && !loading && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg p-3">
          <div className="text-sm text-slate-500 text-center">
            No universities found. You can type any institution name.
          </div>
        </div>
      )}
    </div>
  );
};

export { LocationAutocomplete, UniversityAutocomplete};