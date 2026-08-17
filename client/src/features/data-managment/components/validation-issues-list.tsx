import EmptyState from "../../../components/ui/empty";
import type { ValidationIssue } from "../types";

const formatCode = (code: string) =>
    code.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

const severityIcon: Record<ValidationIssue["severity"], string> = {
    ERROR: "text-red-500 bg-red-50",
    WARNING: "text-amber-500 bg-amber-50",
};

const ValidationIssuesList = ({ issues }: { issues: ValidationIssue[] }) => {
    if (issues.length === 0) {
        return (
            <div className="bg-gray-50 rounded-xl">
                <EmptyState title="No issues found" />
            </div>
        );
    }

    return (
        <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden">
            {issues.map((issue, idx) => (
                <div key={`${issue.row}-${issue.field}-${idx}`} className="flex items-start gap-3 px-4 py-2.5 bg-white">
                    <div className={`size-6 rounded-full flex items-center justify-center flex-shrink-0 ${severityIcon[issue.severity]}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-700">
                            Row {issue.row} <span className="text-gray-400 font-normal">— {issue.field}</span>
                        </p>
                        <p className="text-xs text-gray-500">{formatCode(issue.code)}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ValidationIssuesList;