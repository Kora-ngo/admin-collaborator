import { useEffect, useState } from "react";
import { useAssistanceStore } from "../store/assistanceStore";
import Loading from "../../../components/widgets/loading";
import type { Assistance } from "../../../types/assistance";
import DetailView from "../../../components/widgets/detail-view";

interface AssistanceProps {
  id: number;
  isOpen: boolean;
}


const AssistanceView = ({ id, isOpen }: AssistanceProps) => {
  const { fetchOneData } = useAssistanceStore();
  const [data, setData] = useState<Assistance | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleFetch = async () => {
      if (!isOpen || !id) return;

      try {
        setLoading(true);
        const fetchedData = await fetchOneData(id);
        setData(fetchedData as Assistance);
      } catch (err) {
        console.error("Failed to fetch assistance:", err);
      } finally {
        setLoading(false);
      }
    };

    handleFetch();
  }, [id, isOpen, fetchOneData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loading text="Loading assistance details..." />
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

  // Define display fields with nice labels
  const fields = [
    { label: "Unique - ID", value: `#${data.uid}` },
    { label: "Name", value: data.name },
    { label: "Description", value: data.description || "-" },
    { label: "Type", value: data.assistanceType!.name },
    { label: "Unit", value: data.assistanceType!.unit },
    { label: "Status", value: data.status === "true" ? "Active" : "Inactive" },
    { 
      label: "Created On", 
      value: new Date(data.date_of!).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    { 
      label: "Last Updated", 
      value: new Date(data.update_of!).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
  ];

  return (
    <DetailView
      title={data.name}
      subtitle={`${data.assistanceType!.name} • ${data.assistanceType!.unit}`}
      fields={fields}
    />
  );
};

export default AssistanceView;