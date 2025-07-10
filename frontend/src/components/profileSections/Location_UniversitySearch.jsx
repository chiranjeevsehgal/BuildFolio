import { useState, useEffect, useRef } from "react";

// Location Autocomplete using Nominatim (OpenStreetMap)
const LocationAutocomplete = ({ value, onChange, placeholder, hasError }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef(null);

  const searchLocations = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(false);

    try {
      // Focus on cities, towns, and administrative areas
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&featureType=city,town,village,administrative&countrycodes=us,ca,gb,au,de,fr,in,sg,ae,nl,se,no,dk,fi,ch,at,be,ie,it,es,pt,pl,cz,hu,ro,bg,hr,si,sk,lt,lv,ee,lu,mt,cy`,
      );
      const data = await response.json();

      const formattedSuggestions = data
        .filter((item) => {
          // Filter for places that are cities, towns, or administrative areas
          const placeType = item.type;
          return (
            [
              "city",
              "town",
              "village",
              "municipality",
              "administrative",
            ].includes(placeType) ||
            item.class === "place" ||
            item.class === "boundary"
          );
        })
        .map((item) => {
          const address = item.address || {};
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            "";
          const state =
            address.state || address.province || address.region || "";
          const country = address.country || "";

          let formatted = "";
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
            type: item.type,
          };
        })
        .slice(0, 8); // Limit to 8 suggestions

      setSuggestions(formattedSuggestions);
      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setSuggestions([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value && value.length >= 3) {
      debounceRef.current = setTimeout(() => {
        searchLocations(value);
      }, 600);
    } else {
      setSuggestions([]);
      setLoading(false);
      setHasSearched(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);

    // If user is typing and we have enough characters, show loading immediately
    if (newValue.length >= 3) {
      setLoading(true);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.formatted);
    setShowSuggestions(false);
    setSuggestions([]);
    setHasSearched(false);
  };

  const shouldShowDropdown = showSuggestions && value && value.length >= 3;
  const shouldShowNoResults =
    hasSearched && suggestions.length === 0 && !loading;
  const shouldShowSuggestions = suggestions.length > 0;
  const shouldShowMinChars =
    showSuggestions && value && value.length > 0 && value.length < 3;

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className={`px-3 py-2 border placeholder:!text-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-all duration-200 ${
          hasError ? "border-red-500" : "border-slate-300"
        }`}
      />

      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {shouldShowDropdown && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-in fade-in-0 slide-in-from-top-1 duration-200">
          {loading && (
            <div className="px-3 py-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-slate-500">
                  Searching locations...
                </span>
              </div>
            </div>
          )}

          {shouldShowSuggestions && (
            <>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onMouseDown={() => handleSuggestionClick(suggestion)}
                  className="w-full px-3 py-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none border-b border-slate-100 last:border-b-0 transition-colors duration-150"
                >
                  <div className="text-sm font-medium text-slate-800">
                    {suggestion.formatted}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-1">
                    {suggestion.type} • {suggestion.display_name}
                  </div>
                </button>
              ))}
            </>
          )}

          {shouldShowNoResults && (
            <div className="px-3 py-4">
              <div className="text-sm text-slate-500 text-center">
                <div className="mb-1">🔍 No locations found</div>
                <div className="text-xs">
                  Try a different city or check spelling
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {shouldShowMinChars && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg p-3 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <div className="text-sm text-slate-500 text-center">
            <div className="mb-1">✏️ Keep typing...</div>
            <div className="text-xs">Enter at least 3 characters to search</div>
          </div>
        </div>
      )}
    </div>
  );
};

// University Autocomplete using HipoLabs University API
const UniversityAutocomplete = ({
  value,
  onChange,
  placeholder,
  hasError,
  country = "",
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  const searchUniversities = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setHasSearched(false);
      return;
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setHasSearched(false);
    abortControllerRef.current = new AbortController();

    try {
      let url = `http://universities.hipolabs.com/search?name=${encodeURIComponent(query)}`;
      if (country) {
        url += `&country=${encodeURIComponent(country)}`;
      }

      const timeoutId = setTimeout(
        () => abortControllerRef.current.abort(),
        8000,
      );

      const response = await fetch(url, {
        method: "GET",
        signal: abortControllerRef.current.signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
        cache: "default",
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      if (!text.trim()) {
        throw new Error("Empty response");
      }

      const data = JSON.parse(text);

      if (Array.isArray(data) && data.length > 0) {
        const formattedSuggestions = data
          .filter((university) => university.name && university.name.trim())
          .slice(0, 12)
          .map((university) => ({
            name: university.name.trim(),
            country: university.country || "Unknown",
            domain: university.domain || "",
            website: university.web_pages?.[0] || university.website || "",
            display: `${university.name.trim()}${university.country ? `, ${university.country}` : ""}`,
          }))
          .sort((a, b) => {
            const queryLower = query.toLowerCase();
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();

            if (aName === queryLower) return -1;
            if (bName === queryLower) return 1;
            if (aName.startsWith(queryLower) && !bName.startsWith(queryLower))
              return -1;
            if (bName.startsWith(queryLower) && !aName.startsWith(queryLower))
              return 1;

            return a.name.localeCompare(b.name);
          });

        setSuggestions(formattedSuggestions);
      } else {
        setSuggestions([]);
      }
      setHasSearched(true);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching universities:", error.message);
        setSuggestions([]);
        setHasSearched(true);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value && value.length >= 2) {
      debounceRef.current = setTimeout(() => {
        searchUniversities(value);
      }, 500);
    } else {
      setSuggestions([]);
      setLoading(false);
      setHasSearched(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, country]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);

    // Show loading immediately for better perceived performance
    if (newValue.length >= 2) {
      setLoading(true);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
    setHasSearched(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const shouldShowDropdown = showSuggestions && value && value.length >= 2;
  const shouldShowNoResults =
    hasSearched && suggestions.length === 0 && !loading;
  const shouldShowSuggestions = suggestions.length > 0;
  const shouldShowMinChars =
    showSuggestions && value && value.length > 0 && value.length < 2;

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          if (value.length >= 2 && suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-all duration-200 placeholder:!text-gray-500 ${
          hasError ? "border-red-500" : "border-slate-300"
        }`}
        autoComplete="off"
      />

      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {shouldShowDropdown && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-64 overflow-y-auto animate-in fade-in-0 slide-in-from-top-1 duration-200">
          {loading && (
            <div className="px-3 py-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-slate-500">
                  Searching universities...
                </span>
              </div>
            </div>
          )}

          {shouldShowSuggestions && (
            <>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.name}-${index}`}
                  type="button"
                  onMouseDown={() => handleSuggestionClick(suggestion)}
                  className="w-full px-3 py-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none border-b border-slate-100 last:border-b-0 transition-colors duration-150"
                >
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {suggestion.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-1">
                    {suggestion.country}
                    {suggestion.domain ? ` • ${suggestion.domain}` : ""}
                  </div>
                </button>
              ))}
            </>
          )}

          {shouldShowNoResults && (
            <div className="px-3 py-4">
              <div className="text-sm text-slate-500 text-center">
                <div className="mb-1">🎓 No universities found</div>
                <div className="text-xs">
                  Try a different name or check spelling
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {shouldShowMinChars && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg p-3 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <div className="text-sm text-slate-500 text-center">
            <div className="mb-1">✏️ Keep typing...</div>
            <div className="text-xs">Enter at least 2 characters to search</div>
          </div>
        </div>
      )}
    </div>
  );
};

export { LocationAutocomplete, UniversityAutocomplete };
