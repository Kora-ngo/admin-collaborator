import { useEffect, useState } from "react";
import { locationApi } from "../locationApi";

interface LocationLabels {
  countryName: string;
  regionName: string;
  loading: boolean;
}

// Accepts either a single region code ("CE") or multiple (["CE", "OU", "LT"])
export const useLocationLabels = (
  countryCode?: string,
  regionCode?: string | string[]
): LocationLabels => {
  const [countryName, setCountryName] = useState(countryCode || "");
  const [regionName, setRegionName] = useState("");
  const [loading, setLoading] = useState(!!countryCode);

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      if (!countryCode) {
        setCountryName("");
        setRegionName("");
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const countries = await locationApi.getCountries();
        if (cancelled) return;

        const country = countries.find((c) => c.iso2 === countryCode);
        setCountryName(country?.name || countryCode);

        // Normalize to array
        const regionCodes = Array.isArray(regionCode)
          ? regionCode
          : regionCode
          ? [regionCode]
          : [];

        if (regionCodes.length === 0) {
          setRegionName("");
          return;
        }

        const states = await locationApi.getStates(countryCode);
        if (cancelled) return;

        const names = regionCodes.map((code) => {
          const region = states.find((s) => s.iso2 === code);
          return region?.name || code;
        });

        setRegionName(names.join(", "));
      } catch (err) {
        console.error("Failed to resolve location labels:", err);
        if (!cancelled) {
          setCountryName(countryCode);
          // Fallback: show the raw codes
          const fallback = Array.isArray(regionCode)
            ? regionCode.join(", ")
            : regionCode || "";
          setRegionName(fallback);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    resolve();

    return () => {
      cancelled = true;
    };
  }, [countryCode, Array.isArray(regionCode) ? regionCode.join(",") : regionCode]);

  return { countryName, regionName, loading };
};