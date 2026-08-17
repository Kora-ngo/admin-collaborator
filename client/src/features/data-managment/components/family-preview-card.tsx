import { useState } from "react";
import StatusBadge from "../../../components/ui/status-badge";
import type { PreviewFamily, RowStatus } from "../types";
import type { BadgeColor } from "../../../types/badgeColor";

const statusConfig: Record<RowStatus, { text: string; color: BadgeColor }> = {
    READY: { text: "Ready", color: "purple" },
    WARNING: { text: "Warning", color: "orange" },
    ERROR: { text: "Error", color: "red" },
};

const FamilyPreviewCard = ({ family }: { family: PreviewFamily }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
            <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <svg
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        strokeWidth={1.5} stroke="currentColor"
                        className={`size-4 text-gray-400 flex-shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>

                    <div className="text-left min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                            {family.head_name} <span className="text-gray-400 font-normal">— {family.family_code}</span>
                        </p>
                        {/* <p className="text-xs text-gray-400 truncate">
                            {family.project.name} · {family.members.length} member{family.members.length !== 1 ? "s" : ""}</p> */}

                                           <p className="text-xs text-gray-400 truncate">
                            {family.members.length} member{family.members.length !== 1 ? "s" : ""}</p>
                    </div>
                </div>

                {/* <StatusBadge text={statusConfig[family.status].text} color={statusConfig[family.status].color} /> */}
                {/* <StatusBadge text={statusConfig[family.status].text} color={statusConfig[family.status].color} /> */}

            </button>

            {expanded && (
                <div className="divide-y divide-gray-100 border-t border-gray-100 bg-gray-50/50">
                    {family.members.map((member, idx) => (
                        <div key={`${family.family_code}-${idx}`} className="flex items-center justify-between px-4 py-2 pl-11">
                            <p className="text-xs font-medium text-gray-600">{member.name}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-gray-400 capitalize">{member.gender}</span>
                                <span className="text-[11px] font-semibold text-gray-500">{member.relationship}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FamilyPreviewCard;