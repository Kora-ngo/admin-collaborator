import type { ValidationSummary } from "../types";

const ValidationSummaryBar = ({ summary }: { summary: ValidationSummary }) => {
    const stats: { label: string; value: number; className: string }[] = [
        { label: "Total Rows", value: summary.total_rows, className: "bg-gray-50 text-gray-700" },
        { label: "Families", value: summary.families_detected, className: "bg-blue-50 text-blue-700" },
        { label: "Members", value: summary.members_detected, className: "bg-purple-50 text-purple-700" },
        { label: "Warnings", value: summary.warnings, className: "bg-amber-50 text-amber-700" },
        { label: "Errors", value: summary.errors, className: "bg-red-50 text-red-700" },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {stats.map((stat) => (
                <div key={stat.label} className={`rounded-xl px-3 py-2.5 ${stat.className}`}>
                    <p className="text-lg font-bold leading-none">{stat.value}</p>
                    <p className="text-[11px] font-medium mt-1 opacity-80">{stat.label}</p>
                </div>
            ))}
        </div>
    );
};

export default ValidationSummaryBar;