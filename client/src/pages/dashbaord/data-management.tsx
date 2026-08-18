import { useState, useRef, useEffect } from "react";
import { Button } from "../../components/ui/button";
import Modal from "../../components/ui/modal";
import ActionModalContent from "../../features/data-managment/components/action-modal-content";
import type { DataEntity, Dataset, ModalStep, OperationType, TabFilter } from "../../features/data-managment/types";
import HistoryTable from "../../features/data-managment/components/history-table";
import type { DataOperation } from "../../features/data-managment/types/data-opertion";





// ── Dummy Data ───────────────────────────────────────────────────
const dummyHistory: DataOperation[] = [
    {
        id: 1,
        type: "import",
        entity: "beneficiaries",
        status: "completed",
        records: 342,
        file_name: "beneficiaries_batch_01.xlsx",
        created_by: "Admin User",
        created_at: "2026-07-26T09:15:00Z",
    },
    {
        id: 2,
        type: "export",
        entity: "deliveries",
        status: "completed",
        records: 128,
        file_name: "deliveries_export_july.xlsx",
        created_by: "Admin User",
        created_at: "2026-07-25T14:30:00Z",
    },
    {
        id: 3,
        type: "import",
        entity: "projects",
        status: "failed",
        records: 0,
        file_name: "projects_q3.xlsx",
        created_by: "Admin User",
        created_at: "2026-07-24T11:00:00Z",
        error: "Invalid column headers on row 3",
    },
    {
        id: 4,
        type: "export",
        entity: "beneficiaries",
        status: "completed",
        records: 890,
        file_name: "beneficiaries_full_export.xlsx",
        created_by: "Admin User",
        created_at: "2026-07-23T08:45:00Z",
    },
    {
        id: 5,
        type: "import",
        entity: "assistance",
        status: "processing",
        records: 0,
        file_name: "assistance_types_new.xlsx",
        created_by: "Admin User",
        created_at: "2026-07-27T10:05:00Z",
    },
    {
        id: 6,
        type: "export",
        entity: "deliveries",
        status: "completed",
        records: 54,
        file_name: "deliveries_project_alpha.xlsx",
        created_by: "Admin User",
        created_at: "2026-07-22T16:20:00Z",
    },
    {
        id: 7,
        type: "import",
        entity: "beneficiaries",
        status: "completed",
        records: 75,
        file_name: "beneficiaries_north_region.xlsx",
        created_by: "Admin User",
        created_at: "2026-07-20T13:10:00Z",
    },
];

// ── Entity Badge ─────────────────────────────────────────────────
const entityConfig: Record<DataEntity, { label: string; color: string, icon: any }> = {
    beneficiaries: { label: "Beneficiaries", color: "bg-blue-100 text-blue-600", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg> },
    projects:      { label: "Projects",      color: "bg-purple-100 text-purple-600", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /> </svg> },
    assistance:    { label: "Assistance",    color: "bg-orange-100 text-orange-600", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" /> </svg> },
    deliveries:    { label: "Deliveries",    color: "bg-teal-100 text-teal-600", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">  <path strokeLinecap="round" strokeLinejoin="round" d="m7.875 14.25 1.214 1.942a2.25 2.25 0 0 0 1.908 1.058h2.006c.776 0 1.497-.4 1.908-1.058l1.214-1.942M2.41 9h4.636a2.25 2.25 0 0 1 1.872 1.002l.164.246a2.25 2.25 0 0 0 1.872 1.002h2.092a2.25 2.25 0 0 0 1.872-1.002l.164-.246A2.25 2.25 0 0 1 16.954 9h4.636M2.41 9a2.25 2.25 0 0 0-.16.832V12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 12V9.832c0-.287-.055-.57-.16-.832M2.41 9a2.25 2.25 0 0 1 .382-.632l3.285-3.832a2.25 2.25 0 0 1 1.708-.786h8.43c.657 0 1.281.287 1.709.786l3.284 3.832c.163.19.291.404.382.632M4.5 20.25h15A2.25 2.25 0 0 0 21.75 18v-2.625c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125V18a2.25 2.25 0 0 0 2.25 2.25Z" /> </svg>},
};

// ── Entities available per operation ──────────────────────────────
const importEntities: DataEntity[] = ["beneficiaries", "projects", "assistance"];
const exportEntities: DataEntity[] = ["beneficiaries", "deliveries"];


// ── Main Page ────────────────────────────────────────────────────
const DataManagement = () => {
    const [activeTab, setActiveTab] = useState<TabFilter>("all");

    // Dropdown menu state
    const [openMenu, setOpenMenu] = useState<OperationType | null>(null);
    const importBtnRef = useRef<HTMLDivElement>(null);
    const exportBtnRef = useRef<HTMLDivElement>(null);

    // Action modal state
    const [modalType, setModalType] = useState<OperationType | null>(null);
    const [modalEntity, setModalEntity] = useState<DataEntity | null>(null);
    const [, setModalStep] = useState<ModalStep>("configure");
    const [, setSelectedFile] = useState<File | null>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                importBtnRef.current && !importBtnRef.current.contains(e.target as Node) &&
                exportBtnRef.current && !exportBtnRef.current.contains(e.target as Node)
            ) {
                setOpenMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const totalImports = dummyHistory.filter((r) => r.type === "import").length;
    const totalExports = dummyHistory.filter((r) => r.type === "export").length;

    const filteredHistory = dummyHistory.filter((r) =>
        activeTab === "all" ? true : r.type === activeTab
    );

    const tabs: { key: TabFilter; label: string; count: number }[] = [
        { key: "all", label: "All", count: dummyHistory.length },
        { key: "import", label: "Import", count: totalImports },
        { key: "export", label: "Export", count: totalExports },
    ];

    const handleSelectEntity = (type: OperationType, entity: DataEntity) => {
        setOpenMenu(null);
        setModalType(type);
        setModalEntity(entity);
        setModalStep("configure");
        setSelectedFile(null);
    };

    const closeActionModal = () => {
        setModalType(null);
        setModalEntity(null);
        setModalStep("configure");
        setSelectedFile(null);
    };


    return (
        <div className="space-y-8 pb-12">
            {/* ── History ── */}
            <div className="space-y-4">
                {/* Tab filters */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                    activeTab === tab.key
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                {tab.label}
                                <span className={`text-xs ${activeTab === tab.key ? "text-white/70" : "text-gray-400"}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        {/* Import button + dropdown */}
                        <div className="relative" ref={importBtnRef}>
                            <Button
                                variant="outline"
                                onClick={() => setOpenMenu(openMenu === "import" ? null : "import")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                </svg>
                                Import Data
                            </Button>

                            {openMenu === "import" && (
                                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                                    <p className="px-3 pt-3 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                        Select data to import
                                    </p>
                                    <hr className="text-gray-200" />
                                    {importEntities.map((entity) => (
                                        <button
                                            key={entity}
                                            onClick={() => handleSelectEntity("import", entity)}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="size-4 text-gray-700">{entityConfig[entity].icon}</span>
                                            {entityConfig[entity].label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Export button + dropdown */}
                        <div className="relative" ref={exportBtnRef}>
                            <Button
                                variant="ghost"
                                onClick={() => setOpenMenu(openMenu === "export" ? null : "export")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                Export Data
                            </Button>

                            {openMenu === "export" && (
                                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                                    <p className="px-3 pt-3 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                        Select data to export
                                    </p>
                                    <hr className="text-gray-200" />
                                    {exportEntities.map((entity) => (
                                        <button
                                            key={entity}
                                            onClick={() => handleSelectEntity("export", entity)}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="size-4 text-gray-700">{entityConfig[entity].icon}</span>
                                            {entityConfig[entity].label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <HistoryTable records={filteredHistory} />
            </div>

            {/* ── Action Modal ── */}
            <Modal
                widthClass="w-[50%]"
                isOpen={modalType !== null}
                onClose={closeActionModal}
                title={
                    modalType && modalEntity
                        ? `${modalType === "import" ? "Import" : "Export"} ${entityConfig[modalEntity].label}`
                        : ""
                }
                children={
                    modalType && modalEntity ? (
                        <ActionModalContent dataset={modalEntity.toUpperCase() as Dataset} onClose={closeActionModal} />
                    ) : null
                }
            />
        </div>
    );
};



export default DataManagement;