// src/features/project/components/project-view.tsx

import { useEffect, useState } from "react";
import ProjectViewMembers from "./project-view-members";
import ProjectViewGeneral from "./project-view-general";
import ProjectViewAssistance from "./project-view-assistance";
import ProjectViewFamilies from "./project-view-famillies";
import Loading from "../../../components/widgets/loading";
import type { ProjectFormData } from "../hooks/useProject";
import { useProjectStore } from "../store/projectStore";

interface ProjectViewProps {
  id: number;
  isOpen: boolean;
}

type Tab = "general" | "families" | "assistances" | "members";

const ProjectView = ({ id, isOpen }: ProjectViewProps) => {

const [activeTab, setActiveTab] = useState<Tab>("general");
const [loading, setLoading] = useState(false);
const [data, setData] = useState<ProjectFormData | null>(null);
const {fetchOneData} = useProjectStore();
const [generalData, setGeneralData] = useState({
  name: "",
  description: "",
  start_date: "",
  end_date: "",
  status: "",
  created_at: ""
}) 


  useEffect(() => {
    const handleFetch = async () => {
      if (!isOpen || !id) return;

      try {
        setLoading(true);
        const fetchedData = await fetchOneData(id);
        setData(fetchedData as ProjectFormData);

        console.log("Data --> ", data);
        setGeneralData({
            name: fetchedData.name,
            description: fetchedData!.description!,
            start_date: fetchedData.start_date!.toString(),
            end_date: fetchedData.end_date!.toString(),
            status: fetchedData.status!,
            created_at: fetchedData.created_at!.toString()
        })
      } catch (err) {
        console.error("Failed to fetch assistance:", err);
      } finally {
        setLoading(false);
      }
    };

    handleFetch();
  }, [id, isOpen, fetchOneData]);

  const tabs = [
    {
      key: "general" as Tab,
      label: "General",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
    },
    {
      key: "families" as Tab,
      label: "Families",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      ),
    },
    {
      key: "assistances" as Tab,
      label: "Assistances",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
        </svg>
      ),
    },
    {
      key: "members" as Tab,
      label: "Members",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      ),
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <ProjectViewGeneral data={generalData} />;
      case "families":
        return <ProjectViewFamilies />;
      case "assistances":
        return <ProjectViewAssistance />;
      case "members":
        return <ProjectViewMembers />;
      default:
        return null;
    }
  };


    if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loading text="Loading project details..." />
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

export default ProjectView;