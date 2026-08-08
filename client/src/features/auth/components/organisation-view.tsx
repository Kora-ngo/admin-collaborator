import { useLocationLabels } from "../../common/locations/hooks/uselocationLabels";
import { useAuthStore } from "../store/authStore";

interface OrganisationViewProps {
    onToggle: () => void;
}

const Field = ({ label, value }: { label: string; value: string | undefined }) => (
    <div className="flex flex-col gap-0.5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value || "—"}</p>
    </div>
);

const OrganisationView: React.FC<OrganisationViewProps> = ({ onToggle }) => {
    const { organisation, user } = useAuthStore();
    const { countryName, regionName } = useLocationLabels(organisation?.country, organisation?.region);

    if (!organisation) {
        return <div className="text-gray-500">No organisation data available</div>;
    }

    // Generate initials from organization name
    const initials = organisation.name
        ?.split(" ")
        .map((word) => word[0])
        .filter(Boolean)
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?";

    return (
        <div className="space-y-6">
            {/* Identity card */}
            <div className="flex items-center gap-4 p-4 bg-gray-100/40 rounded-xl border border-gray-200">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                    </svg>
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-900 truncate">
                        {organisation.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                        {organisation.email}
                    </p>
                    {organisation.country && (
                        <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                             {countryName}
                        </span>
                    )}
                </div>

                {/* Conditional Edit Button */}
                {organisation.created_by === user?.id && (
                    <button
                        onClick={onToggle}
                        className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary border border-gray-200 hover:border-primary/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={1.5} 
                            stroke="currentColor" 
                            className="size-3.5"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" 
                            />
                        </svg>
                        Edit
                    </button>
                )}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                {[
                    { label: "Name", value: organisation.name },
                    // { label: "Email Address", value: organisation.email },
                    { label: "Phone Number", value: organisation.phone },
                    { label: "Country - Region", value: `${countryName}${regionName ? ` - ${regionName}` : ""}` },
                    // { label: "Region", value: organisation.region },
                ].map((item, i) => (
                    <div key={i} className="bg-white px-4 py-3">
                        <Field label={item.label} value={item.value} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrganisationView;