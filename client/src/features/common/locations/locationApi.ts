import locationApiInstance from "./utils/locationapiInstance";

export interface CountryOption {
    id: number;
    name: string;
    iso2: string;
    emoji?: string;
}

export interface RegionOption {
    id: number;
    name: string;
    iso2: string;
}

// Simple in-memory cache + in-flight de-dupe so CountrySelect, RegionSelect,
// and any display-only lookup (useLocationLabels) don't all re-fetch the
// same data independently.
let countriesCache: CountryOption[] | null = null;
let countriesPromise: Promise<CountryOption[]> | null = null;

const statesCache: Record<string, RegionOption[]> = {};
const statesPromises: Record<string, Promise<RegionOption[]>> = {};

export const locationApi = {
    getCountries: async (): Promise<CountryOption[]> => {
        if (countriesCache) return countriesCache;

        if (!countriesPromise) {
            countriesPromise = locationApiInstance.get("/countries").then(({ data }) => {
                countriesCache = data as CountryOption[];
                return countriesCache;
            });
        }

        return countriesPromise;
    },

    getStates: async (countryIso2: string): Promise<RegionOption[]> => {
        if (statesCache[countryIso2]) return statesCache[countryIso2];

        if (!statesPromises[countryIso2]) {
            statesPromises[countryIso2] = locationApiInstance
                .get(`/countries/${countryIso2}/states`)
                .then(({ data }) => {
                    statesCache[countryIso2] = data as RegionOption[];
                    return statesCache[countryIso2];
                });
        }

        return statesPromises[countryIso2];
    },
};