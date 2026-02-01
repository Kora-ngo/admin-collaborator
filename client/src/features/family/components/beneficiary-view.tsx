
import { useEffect, useState } from "react";
import { useBeneficiaryStore } from "../store/beneficiaryStore";
import Loading from "../../../components/widgets/loading";
import type { Beneficiary } from "../../../types/beneficiary";
import BeneficiaryViewGeneral from "./beneficiary-view-general";
import BeneficiaryViewMembers from "./beneficiary-view-members";

interface BeneficiaryViewProps {
    id: number;
    isOpen: boolean;
}

type Tab = "overview" | "members";

const BeneficiaryView = ({ id, isOpen }: BeneficiaryViewProps) => {
    const { fetchOneData } = useBeneficiaryStore();
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [data, setData] = useState<Beneficiary | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleFetch = async () => {
            if (!isOpen || !id) return;

            try {
                setLoading(true);
                const fetchedData = await fetchOneData(id);
                setData(fetchedData);
            } catch (err) {
                console.error("Failed to fetch beneficiary:", err);
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
            key: "members" as Tab,
            label: "Family Members",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
            ),
        },
    ];

    const renderContent = () => {
        if (!data) return null;

        switch (activeTab) {
            case "overview":
                return <BeneficiaryViewGeneral data={data} />;
            case "members":
                return <BeneficiaryViewMembers members={data.members || []} />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loading text="Loading beneficiary details..." />
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

export default BeneficiaryView;