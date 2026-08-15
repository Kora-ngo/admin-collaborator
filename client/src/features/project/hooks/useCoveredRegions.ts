import { useEffect, useState } from "react";
import { useAuthStore } from "../../auth/store/authStore";
import { locationApi, type RegionOption } from "../../common/locations/locationApi";

export const useCoveredRegions = () => {
    const organisation = useAuthStore((state) => state.organisation);

    // Defaults to the org's own country once it loads, but stays editable —
    // a project can operate in a different country than the org is based in.
    const [selectedCountry, setSelectedCountry] = useState<string>("");
    const [regionsData, setRegionsData] = useState<RegionOption[]>([]);
    const [loadingRegions, setLoadingRegions] = useState(false);

    // Selected covered regions (tags)
    const [selectedRegions, setSelectedRegions] = useState<RegionOption[]>([]);

    // Add this function, near handleCountryChange:
    const hydrateFromCodes = async (countryCode: string, regionCodes: string[]) => {
        setSelectedCountry(countryCode);

        if (!countryCode || regionCodes.length === 0) {
            setSelectedRegions([]);
            return;
        }

        try {
            setLoadingRegions(true);
            const data = await locationApi.getStates(countryCode);
            setRegionsData(data);
            setSelectedRegions(data.filter((r) => regionCodes.includes(r.iso2)));
        } catch (err) {
            console.error("Failed to hydrate covered regions:", err);
        } finally {
            setLoadingRegions(false);
        }
    };
    
    useEffect(() => {
        if (organisation?.country && !selectedCountry) {
            setSelectedCountry(organisation.country);
        }
    }, [organisation]);

    // Fetch the region list whenever the chosen country changes
    useEffect(() => {
        if (!selectedCountry) {
            setRegionsData([]);
            return;
        }

        const fetchRegions = async () => {
            try {
                setLoadingRegions(true);
                const data = await locationApi.getStates(selectedCountry);
                setRegionsData(data);
            } catch (err) {
                console.error("Failed to fetch covered-region options:", err);
                setRegionsData([]);
            } finally {
                setLoadingRegions(false);
            }
        };

        fetchRegions();
    }, [selectedCountry]);

    const handleCountryChange = (countryCode: string) => {
        setSelectedCountry(countryCode);
        setSelectedRegions([]); // previously picked regions belong to the old country
    };

    const handleAddRegion = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (!value) return;


        const region = regionsData.find((r) => r.iso2 === value);
        if (region && !selectedRegions.some((s) => s.iso2 === region.iso2)) {
            setSelectedRegions([...selectedRegions, region]);
        }

        e.target.value = '';
    };

    const handleRemoveRegion = (iso2: string) => {
        setSelectedRegions(selectedRegions.filter((r) => r.iso2 !== iso2));
    };

    const handleClearAllRegions = () => {
        setSelectedRegions([]);
    };

    // Available options: exclude already selected
    const availableRegionOptions = regionsData.filter(
        (r) => !selectedRegions.some((s) => s.iso2 === r.iso2)
    );

    return {
        selectedCountry,
        handleCountryChange,
        loadingRegions,

        selectedRegions,
        availableRegionOptions,

        setSelectedRegions,

        handleAddRegion,
        handleRemoveRegion,
        handleClearAllRegions,
        hydrateFromCodes
    };
};