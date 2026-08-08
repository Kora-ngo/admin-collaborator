import { useState } from "react";
import { Button } from "../../../components/ui/button";
import ValidationSummaryBar from "./validation-summary-bar";
import FamilyPreviewCard from "./family-preview-card";


import type { Dataset } from "../types";
import ValidationIssuesList from "./validation-issues-list";
import { useDataOperations } from "../hooks/useDataOperations";

// ── Expected columns per dataset (for upload instructions) ────────
const datasetColumns: Record<Dataset, string[]> = {
    BENEFICIARIES: ["Family Code", "Head Name", "Member Name", "Gender", "Relationship", "Project"],
    PROJECTS: [],
    DELIVERIES: [],
    USERS: [],
};

const datasetLabel: Record<Dataset, string> = {
    BENEFICIARIES: "Beneficiaries",
    PROJECTS: "Projects",
    DELIVERIES: "Deliveries",
    USERS: "Users",
};

type ValidationTab = "preview" | "issues";

const ImportModalContent = ({ dataset, onClose }: { dataset: Dataset; onClose: () => void }) => {
    const { step, selectedFile, handleFileSelect, handleValidate, handleConfirm, validationResult, validating } =
        useDataOperations(dataset);

    const [validationTab, setValidationTab] = useState<ValidationTab>("preview");

    // ── Step: Upload ────────────────────────────────────────────
    if (step === "upload") {
        return (
            <div className="py-2">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                Expected columns
                            </p>
                            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden">
                                {datasetColumns[dataset].map((col) => (
                                    <div key={col} className="flex items-center gap-2 px-3 py-2 bg-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3.5 text-gray-300 flex-shrink-0">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.007H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.007H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.007H3.75v-.007Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                        </svg>
                                        <span className="text-xs font-medium text-gray-600">{col}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-amber-500 flex-shrink-0 mt-0.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                            <p className="text-xs text-amber-700">
                                Your file will be checked against these columns before anything is imported. Nothing is saved to Kora until you confirm.
                            </p>
                        </div>
                    </div>

                    <div className="md:col-span-3 flex flex-col">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                            Your file
                        </p>

                        <div
                            onClick={() => document.getElementById("data-op-file-input")?.click()}
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
                                id="data-op-file-input"
                                type="file"
                                accept=".xlsx,.csv"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                            />
                        </div>

                        {selectedFile && (
                            <button
                                onClick={() => handleFileSelect(null)}
                                className="text-xs text-gray-400 hover:text-red-500 mt-2 self-start transition-colors"
                            >
                                Remove file
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-6 mt-2 border-t border-gray-100">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleValidate} disabled={!selectedFile} loading={validating}>
                        Validate File
                    </Button>
                </div>
            </div>
        );
    }

    // ── Step: Processing ────────────────────────────────────────
    if (step === "processing") {
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
                        Validating {datasetLabel[dataset].toLowerCase()}...
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Checking your file against Kora's records</p>
                </div>
            </div>
        );
    }

    // ── Step: Validation ────────────────────────────────────────
    if (step === "validation" && validationResult) {
        const { summary, preview, issues } = validationResult;
        const hasBlockingErrors = summary.errors > 0;

        return (
            <div className="py-2 space-y-5">
                <ValidationSummaryBar summary={summary} />

                <div className="flex gap-2">
                    {(["preview", "issues"] as ValidationTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setValidationTab(tab)}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                validationTab === tab
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            {tab === "preview" ? "Preview" : "Issues"}
                            <span className={`text-xs ${validationTab === tab ? "text-white/70" : "text-gray-400"}`}>
                                {tab === "preview" ? preview.length : issues.length}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1">
                    {validationTab === "preview" ? (
                        preview.map((family) => (
                            <FamilyPreviewCard key={family.family_code} family={family} />
                        ))
                    ) : (
                        <ValidationIssuesList issues={issues} />
                    )}
                </div>

                {hasBlockingErrors && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-red-500 flex-shrink-0 mt-0.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                        <p className="text-xs text-red-700">
                            {summary.errors} row{summary.errors !== 1 ? "s" : ""} must be fixed in your file before this dataset can be imported.
                        </p>
                    </div>
                )}

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={hasBlockingErrors}>
                        Confirm Import
                    </Button>
                </div>
            </div>
        );
    }

    // ── Step: Completed ─────────────────────────────────────────
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-7 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </div>
            <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">Import Completed</p>
                <p className="text-xs text-gray-400 mt-1">
                    {datasetLabel[dataset]} are now available in Kora.
                </p>
            </div>
            <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
    );
};

export default ImportModalContent;