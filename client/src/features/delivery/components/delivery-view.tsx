import { useEffect, useState } from "react";
import { useDeliveryStore } from "../store/deliveryStore";
import Loading from "../../../components/widgets/loading";
import type { Delivery } from "../../../types/delivery";
import DeliveryViewGeneral from "./delivery-view-general";
import DeliveryViewItems from "./delivery-view-items";

interface DeliveryViewProps {
    id: number;
    isOpen: boolean;
}

type Tab = "overview" | "items";

const DeliveryView = ({ id, isOpen }: DeliveryViewProps) => {
    const { fetchOneData } = useDeliveryStore();
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [data, setData] = useState<Delivery | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleFetch = async () => {
            if (!isOpen || !id) return;

            try {
                setLoading(true);
                const fetchedData = await fetchOneData(id);
                setData(fetchedData);
            } catch (err) {
                console.error("Failed to fetch delivery:", err);
            } finally {
                setLoading(false);
            }
        };

        handleFetch();
    }, [id, isOpen, fetchOneData]);

    const tabs = [
        {
            key: "overview" as Tab,
            label: "Overview",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                ),
                },
                {
                key: "items" as Tab,
                label: "Delivery Items",
                icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                </svg>
                ),
                }
                ];

                const renderContent = () => {
    if (!data) return null;

    switch (activeTab) {
        case "overview":
            return <DeliveryViewGeneral data={data} />;
        case "items":
            return <DeliveryViewItems items={data.items || []} />;
        default:
            return null;
    }
};

if (loading) {
    return (
        <div className="flex items-center justify-center py-20">
            <Loading text="Loading delivery details..." />
        </div>
    );
}

if (!data) {
    return (
        <div className="text-center py-10 text-gray-500">
            No data available
        </div>
    );
}

return (
    <div>
        {/* Tab Bar */}
        <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex text-sm items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                        activeTab === tab.key
                            ? "text-primary border-primary bg-primary/5"
                            : "text-gray-500 border-transparent hover:text-gray-700"
                    }`}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
            {renderContent()}
        </div>
    </div>
);
};
export default DeliveryView;