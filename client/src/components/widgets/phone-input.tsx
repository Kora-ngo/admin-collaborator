import { useState, useRef, useEffect } from "react";

interface Country {
  name: string;
  code: string;
  dial: string;
  flag: string;
}

const countries: Country[] = [
  { name: "Afghanistan", code: "AF", dial: "+93", flag: "🇦🇫" },
  { name: "Albania", code: "AL", dial: "+355", flag: "🇦🇱" },
  { name: "Algeria", code: "DZ", dial: "+213", flag: "🇩🇿" },
  { name: "Argentina", code: "AR", dial: "+54", flag: "🇦🇷" },
  { name: "Australia", code: "AU", dial: "+61", flag: "🇦🇺" },
  { name: "Austria", code: "AT", dial: "+43", flag: "🇦🇹" },
  { name: "Belgium", code: "BE", dial: "+32", flag: "🇧🇪" },
  { name: "Bolivia", code: "BO", dial: "+591", flag: "🇧🇴" },
  { name: "Brazil", code: "BR", dial: "+55", flag: "🇧🇷" },
  { name: "Cameroon", code: "CM", dial: "+237", flag: "🇨🇲" },
  { name: "Canada", code: "CA", dial: "+1", flag: "🇨🇦" },
  { name: "Chad", code: "TD", dial: "+235", flag: "🇹🇩" },
  { name: "Chile", code: "CL", dial: "+56", flag: "🇨🇱" },
  { name: "China", code: "CN", dial: "+86", flag: "🇨🇳" },
  { name: "Colombia", code: "CO", dial: "+57", flag: "🇨🇴" },
  { name: "Congo (DRC)", code: "CD", dial: "+243", flag: "🇨🇩" },
  { name: "Congo (Republic)", code: "CG", dial: "+242", flag: "🇨🇬" },
  { name: "Côte d'Ivoire", code: "CI", dial: "+225", flag: "🇨🇮" },
  { name: "Czech Republic", code: "CZ", dial: "+420", flag: "🇨🇿" },
  { name: "Denmark", code: "DK", dial: "+45", flag: "🇩🇰" },
  { name: "Egypt", code: "EG", dial: "+20", flag: "🇪🇬" },
  { name: "Ethiopia", code: "ET", dial: "+251", flag: "🇪🇹" },
  { name: "Finland", code: "FI", dial: "+358", flag: "🇫🇮" },
  { name: "France", code: "FR", dial: "+33", flag: "🇫🇷" },
  { name: "Gabon", code: "GA", dial: "+241", flag: "🇬🇦" },
  { name: "Germany", code: "DE", dial: "+49", flag: "🇩🇪" },
  { name: "Ghana", code: "GH", dial: "+233", flag: "🇬🇭" },
  { name: "Greece", code: "GR", dial: "+30", flag: "🇬🇷" },
  { name: "Guinea", code: "GN", dial: "+224", flag: "🇬🇳" },
  { name: "India", code: "IN", dial: "+91", flag: "🇮🇳" },
  { name: "Indonesia", code: "ID", dial: "+62", flag: "🇮🇩" },
  { name: "Iran", code: "IR", dial: "+98", flag: "🇮🇷" },
  { name: "Iraq", code: "IQ", dial: "+964", flag: "🇮🇶" },
  { name: "Ireland", code: "IE", dial: "+353", flag: "🇮🇪" },
  { name: "Israel", code: "IL", dial: "+972", flag: "🇮🇱" },
  { name: "Italy", code: "IT", dial: "+39", flag: "🇮🇹" },
  { name: "Japan", code: "JP", dial: "+81", flag: "🇯🇵" },
  { name: "Jordan", code: "JO", dial: "+962", flag: "🇯🇴" },
  { name: "Kenya", code: "KE", dial: "+254", flag: "🇰🇪" },
  { name: "Lebanon", code: "LB", dial: "+961", flag: "🇱🇧" },
  { name: "Libya", code: "LY", dial: "+218", flag: "🇱🇾" },
  { name: "Madagascar", code: "MG", dial: "+261", flag: "🇲🇬" },
  { name: "Malaysia", code: "MY", dial: "+60", flag: "🇲🇾" },
  { name: "Mali", code: "ML", dial: "+223", flag: "🇲🇱" },
  { name: "Mexico", code: "MX", dial: "+52", flag: "🇲🇽" },
  { name: "Morocco", code: "MA", dial: "+212", flag: "🇲🇦" },
  { name: "Mozambique", code: "MZ", dial: "+258", flag: "🇲🇿" },
  { name: "Netherlands", code: "NL", dial: "+31", flag: "🇳🇱" },
  { name: "New Zealand", code: "NZ", dial: "+64", flag: "🇳🇿" },
  { name: "Niger", code: "NE", dial: "+227", flag: "🇳🇪" },
  { name: "Nigeria", code: "NG", dial: "+234", flag: "🇳🇬" },
  { name: "Norway", code: "NO", dial: "+47", flag: "🇳🇴" },
  { name: "Pakistan", code: "PK", dial: "+92", flag: "🇵🇰" },
  { name: "Peru", code: "PE", dial: "+51", flag: "🇵🇪" },
  { name: "Philippines", code: "PH", dial: "+63", flag: "🇵🇭" },
  { name: "Poland", code: "PL", dial: "+48", flag: "🇵🇱" },
  { name: "Portugal", code: "PT", dial: "+351", flag: "🇵🇹" },
  { name: "Romania", code: "RO", dial: "+40", flag: "🇷🇴" },
  { name: "Russia", code: "RU", dial: "+7", flag: "🇷🇺" },
  { name: "Rwanda", code: "RW", dial: "+250", flag: "🇷🇼" },
  { name: "Saudi Arabia", code: "SA", dial: "+966", flag: "🇸🇦" },
  { name: "Senegal", code: "SN", dial: "+221", flag: "🇸🇳" },
  { name: "South Africa", code: "ZA", dial: "+27", flag: "🇿🇦" },
  { name: "South Korea", code: "KR", dial: "+82", flag: "🇰🇷" },
  { name: "Spain", code: "ES", dial: "+34", flag: "🇪🇸" },
  { name: "Sudan", code: "SD", dial: "+249", flag: "🇸🇩" },
  { name: "Sweden", code: "SE", dial: "+46", flag: "🇸🇪" },
  { name: "Switzerland", code: "CH", dial: "+41", flag: "🇨🇭" },
  { name: "Tanzania", code: "TZ", dial: "+255", flag: "🇹🇿" },
  { name: "Thailand", code: "TH", dial: "+66", flag: "🇹🇭" },
  { name: "Togo", code: "TG", dial: "+228", flag: "🇹🇬" },
  { name: "Tunisia", code: "TN", dial: "+216", flag: "🇹🇳" },
  { name: "Turkey", code: "TR", dial: "+90", flag: "🇹🇷" },
  { name: "Uganda", code: "UG", dial: "+256", flag: "🇺🇬" },
  { name: "Ukraine", code: "UA", dial: "+380", flag: "🇺🇦" },
  { name: "United Arab Emirates", code: "AE", dial: "+971", flag: "🇦🇪" },
  { name: "United Kingdom", code: "GB", dial: "+44", flag: "🇬🇧" },
  { name: "United States", code: "US", dial: "+1", flag: "🇺🇸" },
  { name: "Venezuela", code: "VE", dial: "+58", flag: "🇻🇪" },
  { name: "Vietnam", code: "VN", dial: "+84", flag: "🇻🇳" },
  { name: "Zambia", code: "ZM", dial: "+260", flag: "🇿🇲" },
  { name: "Zimbabwe", code: "ZW", dial: "+263", flag: "🇿🇼" },
];

interface PhoneInputProps {
  value: string;
  onChange: (fullPhone: string) => void;
  hasError?: boolean;
  placeholder?: string;
  defaultCountryCode?: string; // e.g. "CM" for Cameroon
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  hasError = false,
  placeholder = "Your phone number",
  defaultCountryCode = "CM",
}) => {
  const defaultCountry = countries.find((c) => c.code === defaultCountryCode) || countries[0];

  // Parse existing value into dial + number
  const parseValue = () => {
    for (const country of countries) {
      if (value.startsWith(country.dial)) {
        return {
          country,
          number: value.slice(country.dial.length).trim(),
        };
      }
    }
    return { country: defaultCountry, number: value };
  };

  const parsed = parseValue();
  const [selectedCountry, setSelectedCountry] = useState<Country>(parsed.country);
  const [phoneNumber, setPhoneNumber] = useState(parsed.number);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
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

  // Focus search when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Emit full phone number on change
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/[^0-9]/g, ""); // digits only
    setPhoneNumber(num);
    onChange(`${selectedCountry.dial} ${num}`);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearch("");
    onChange(`${country.dial} ${phoneNumber}`);
  };

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search)
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input Row */}
      <div
        className={`flex items-center border rounded-md bg-white transition-colors ${
          hasError
            ? "border-red-500 focus-within:border-red-500"
            : "border-gray-300 focus-within:border-primary"
        }`}
      >
        {/* Country Code Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-3 py-2.5 border-r border-gray-200 hover:bg-gray-50 transition-colors rounded-l-md flex-shrink-0"
        >
          <span className="text-lg leading-none">{selectedCountry.flag}</span>
          <span className="text-sm font-medium text-gray-700">{selectedCountry.dial}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          >
            <path
              fillRule="evenodd"
              d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={handleNumberChange}
          placeholder={placeholder}
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent rounded-r-md text-gray-900 placeholder-gray-400"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Search */}
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
                placeholder="Search country or code..."
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

          {/* Country List */}
          <div className="max-h-56 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                No countries found
              </div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left ${
                    selectedCountry.code === country.code ? "bg-primary/5 text-primary" : "text-gray-700"
                  }`}
                >
                  <span className="text-lg leading-none flex-shrink-0">{country.flag}</span>
                  <span className="flex-1 font-medium">{country.name}</span>
                  <span className="text-gray-400 flex-shrink-0">{country.dial}</span>
                  {selectedCountry.code === country.code && (
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

export default PhoneInput;