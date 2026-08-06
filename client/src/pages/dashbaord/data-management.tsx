import { useState, useRef, useEffect } from "react";
import { formatDate } from "../../utils/formatDate";
import StatusBadge from "../../components/ui/status-badge";
import { Button } from "../../components/ui/button";
import Modal from "../../components/ui/modal";

// ── Types ────────────────────────────────────────────────────────
type OperationType = "import" | "export";
type OperationStatus = "completed" | "failed" | "processing";
type DataEntity = "beneficiaries" | "projects" | "assistance" | "deliveries";
type TabFilter = "all" | "import" | "export";

interface DataOperation {
    id: number;
    type: OperationType;
    entity: DataEntity;
    status: OperationStatus;
    records: number;
    file_name: string;
    created_by: string;
    created_at: string;
    error?: string;
}

// ── Expected columns per entity (for import instructions) ─────────
const entityColumns: Record<DataEntity, string[]> = {
    beneficiaries: ["Full Name", "Gender", "Date of Birth", "Phone", "Project", "Region"],
    projects: ["Project Name", "Start Date", "End Date", "Region", "Status"],
    assistance: ["Assistance Type", "Description", "Unit", "Category"],
    deliveries: ["Beneficiary", "Project", "Item", "Quantity", "Delivery Date"],
};


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

type ModalStep = "configure" | "confirming" | "done";

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
    const [modalStep, setModalStep] = useState<ModalStep>("configure");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

    // Dummy "proceed" — just walks through UI states
    const handleProceed = () => {
        setModalStep("confirming");
        setTimeout(() => {
            setModalStep("done");
        }, 1500);
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
                        <ActionModalContent
                            type={modalType}
                            entity={modalEntity}
                            step={modalStep}
                            selectedFile={selectedFile}
                            onFileSelect={setSelectedFile}
                            onProceed={handleProceed}
                            onClose={closeActionModal}
                        />
                    ) : null
                }
            />
        </div>
    );
};

// ── Action Modal Content (import/export flow, UI only) ────────────
const ActionModalContent = ({
    type,
    entity,
    step,
    selectedFile,
    onFileSelect,
    onProceed,
    onClose,
}: {
    type: OperationType;
    entity: DataEntity;
    step: ModalStep;
    selectedFile: File | null;
    onFileSelect: (file: File | null) => void;
    onProceed: () => void;
    onClose: () => void;
}) => {
    // ── Step: Configure ──────────────────────────────────────────
    if (step === "configure") {
        if (type === "import") {
            return (
                <div className="py-2">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

                        {/* Left: instructions */}
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                    Expected columns
                                </p>
                                <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden">
                                    {entityColumns[entity].map((col) => (
                                        <div key={col} className="flex items-center gap-2 px-3 py-2 bg-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3.5 text-gray-300 flex-shrink-0">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.007H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.007H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.007H3.75v-.007Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                            </svg>
                                            <span className="text-xs font-medium text-gray-600">{col}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => console.log(`Download ${entity} template`)}
                                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border border-dashed border-gray-200 text-xs font-semibold text-primary hover:bg-primary/5 hover:border-primary/30 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                Download sample template
                            </button>

                            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-amber-500 flex-shrink-0 mt-0.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                </svg>
                                <p className="text-xs text-amber-700">
                                    The first row must contain column headers matching the names above, in any order.
                                </p>
                            </div>
                        </div>

                        {/* Right: upload zone */}
                        <div className="md:col-span-3 flex flex-col">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                Your file
                            </p>

                            <div
                                onClick={() => document.getElementById("import-file-input")?.click()}
                                className="flex-1 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-10 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors min-h-[220px]"
                            >
                                {selectedFile ? (
                                    <>
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-primary">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                            </svg>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-gray-700">{selectedFile.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {(selectedFile.size / 1024).toFixed(0)} KB — click to change
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-gray-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                            </svg>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-gray-700">Drop your file here</p>
                                            <p className="text-xs text-gray-400 mt-0.5">or click to browse (.xlsx, .csv)</p>
                                        </div>
                                    </>
                                )}
                                <input
                                    id="import-file-input"
                                    type="file"
                                    accept=".xlsx,.csv"
                                    className="hidden"
                                    onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
                                />
                            </div>

                            {selectedFile && (
                                <button
                                    onClick={() => onFileSelect(null)}
                                    className="text-xs text-gray-400 hover:text-red-500 mt-2 self-start transition-colors"
                                >
                                    Remove file
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-6 mt-2 border-t border-gray-100">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={onProceed} disabled={!selectedFile}>
                            Start Import
                        </Button>
                    </div>
                </div>
            );
        }

        // ── export configure step ──────────────────────────────
        return (
            <div className="py-2 space-y-5">
                <p className="text-sm text-gray-500">
                    You're about to export{" "}
                    <span className="font-semibold text-gray-700">all {entityConfig[entity].label.toLowerCase()}</span>{" "}
                    records currently in the system as an Excel file.
                </p>

                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Included columns
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {entityColumns[entity].map((col) => (
                            <div key={col} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3.5 text-green-500 flex-shrink-0">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                <span className="text-xs font-medium text-gray-600">{col}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-primary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">
                            {entityConfig[entity].label.toLowerCase()}_export.xlsx
                        </p>
                        <p className="text-xs text-gray-400">Format: Excel (.xlsx)</p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={onProceed}>Start Export</Button>
                </div>
            </div>
        );
    }

    // ── Step: Confirming ────────────────────────────────────────
    if (step === "confirming") {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg className="animate-spin size-7 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                </div>
                <div className="text-center">
                    <p className="text-sm font-semibold text-gray-800">
                        {type === "import" ? "Importing" : "Exporting"} {entityConfig[entity].label.toLowerCase()}...
                    </p>
                    <p className="text-xs text-gray-400 mt-1">This may take a few moments</p>
                </div>
            </div>
        );
    }

    // ── Step: Done ───────────────────────────────────────────────
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-7 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </div>
            <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">
                    {type === "import" ? "Import" : "Export"} Completed
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    {entityConfig[entity].label} {type === "import" ? "have been imported" : "have been exported"} successfully.
                </p>
            </div>
            <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
    );
};

// ── History Table ────────────────────────────────────────────────
const HistoryTable = ({ records }: { records: DataOperation[] }) => {
    if (records.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">No records yet</p>
                <p className="text-xs text-gray-400 mt-1">Import or export operations will appear here</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {records.map((op) => (
                        <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    op.type === "import"
                                        ? "bg-primary/10 text-primary"
                                        : "bg-green-100 text-green-700"
                                }`}>
                                    {op.type === "import" ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                    )}
                                    {op.type.charAt(0).toUpperCase() + op.type.slice(1)}
                                </span>
                            </td>

                            <td className="px-4 py-3">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${entityConfig[op.entity].color}`}>
                                    {entityConfig[op.entity].label}
                                </span>
                            </td>

                            <td className="px-4 py-3">
                                <p className="text-xs text-gray-600 font-mono truncate max-w-[160px]">{op.file_name}</p>
                            </td>

                            <td className="px-4 py-3">
                                <p className="text-sm font-semibold text-gray-700">
                                    {op.records > 0 ? op.records.toLocaleString() : "—"}
                                </p>
                            </td>

                            <td className="px-4 py-3">
                                <p className="text-xs text-gray-500">{formatDate(op.created_at, false)}</p>
                            </td>

                            <td className="px-4 py-3">
                                <div className="flex gap-1">
                                    {op.status === "completed"  && <StatusBadge text="Completed"  color="green"  />}
                                    {op.status === "failed"     && <StatusBadge text="Failed"     color="red"    />}
                                    {op.status === "processing" && <StatusBadge text="Processing" color="yellow" />}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataManagement;