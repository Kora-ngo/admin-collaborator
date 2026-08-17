import { useState, useRef, useEffect } from "react";
import { locationApi, type RegionOption } from "../../features/common/locations/locationApi";

interface RegionSelectProps {
  country: string; // country iso2 code, e.g. "CM" — regions are fetched for this
  value: string;    // region iso2 code, e.g. "CE"
  onChange: (regionCode: string) => void;
  hasError?: boolean;
  placeholder?: string;
}

const RegionSelect: React.FC<RegionSelectProps> = ({
  country,
  value,
  onChange,
  hasError = false,
  placeholder = "Select a region",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [regions, setRegions] = useState<RegionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!country) {
      setRegions([]);
      return;
    }

    const fetchStates = async () => {
      try {
        setLoading(true);
        const data = await locationApi.getStates(country);
        setRegions(data);
      } catch (err) {
        console.error("Failed to fetch regions:", err);
        setRegions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, [country]);

  const selected = regions.find((r) => r.iso2 === value) || null;
  const disabled = !country || loading;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = regions.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (region: RegionOption) => {
    onChange(region.iso2);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 border rounded-md bg-white text-sm transition-colors ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        } ${
          hasError
            ? "border-red-500"
            : isOpen
            ? "border-primary ring-1 ring-primary/30"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        {!country ? (
          <span className="text-gray-400">Select a country first</span>
        ) : loading ? (
          <span className="text-gray-400">Loading regions...</span>
        ) : selected ? (
          <span className="text-gray-900 font-medium">{selected.name}</span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path
            fillRule="evenodd"
            d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search region..."
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                {regions.length === 0 ? "No regions available for this country" : "No regions found"}
              </div>
            ) : (
              filtered.map((region) => (
                <button
                  key={region.iso2}
                  type="button"
                  onClick={() => handleSelect(region)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left ${
                    selected?.iso2 === region.iso2 ? "bg-primary/5 text-primary" : "text-gray-700"
                  }`}
                >
                  <span className="flex-1 font-medium">{region.name}</span>
                  {selected?.iso2 === region.iso2 && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-primary flex-shrink-0">
                      <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionSelect;