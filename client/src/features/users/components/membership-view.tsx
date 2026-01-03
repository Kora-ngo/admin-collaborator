import { useEffect, useState } from "react";
import { useMembershipStore } from "../store/membershipStore";
import type { Membership } from "../../../types/membership";
import Loading from "../../../components/widgets/loading";
import DetailView from "../../../components/widgets/detail-view";

interface MembershipViewProps {
    id: number;
    isOpen: boolean;
}

const MembershipView = ({ id, isOpen }: MembershipViewProps) => {

    const {fetchOneData} = useMembershipStore();
    const [data, setData] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            if (!isOpen || !id) return;

            try {
                setLoading(true);
                const fetched = await fetchOneData(id);
                setData(fetched as Membership);
            } catch (err) {
                console.error("Failed to fetch membership:", err);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [id, isOpen, fetchOneData]);


    if (loading) {
        return <div className="flex items-center justify-center py-20"><Loading text="Loading details..." /></div>;
    }

    if (!data) {
        return <div className="text-center py-10 text-gray-500">No data available</div>;
    }

    const fields = [
        { label: "User", value: data.user.name },
        { label: "Email", value: data.user.email },
        { label: "Phone", value: data.user.phone || "-" },
        { label: "Role", value: data.role.charAt(0).toUpperCase() + data.role.slice(1) },
        { label: "Status", value: data.status === "true" ? "Active" : "Blocked" },
        { label: "Created On", value: new Date(data.date_of!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
    ];

    return (
        <DetailView
            title={`${data.user.name} - ${data.role}`}
            fields={fields}
        />
    );
}
 
export default MembershipView;