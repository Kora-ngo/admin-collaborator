import { useCallback, useEffect, useState } from "react";
import { locationApi } from "../features/common/locations/locationApi";

export async function getRegionNameMap(countryCode: string): Promise<Record<string, string>> {
  const states = await locationApi.getStates(countryCode);
  return Object.fromEntries(states.map((s) => [s.iso2, s.name]));
}


export function useRegionNameLookup(countryCode?: string) {
  const [map, setMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!countryCode) {
      setMap({});
      return;
    }

    let cancelled = false;
    getRegionNameMap(countryCode).then((m) => {
      if (!cancelled) setMap(m);
    });

    return () => { cancelled = true; };
  }, [countryCode]);

  // returns a stable function
  return useCallback((code: string) => map[code] ?? code, [map]);
}