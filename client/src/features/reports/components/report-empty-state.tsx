import EmptyState from "../../../components/ui/empty";

interface ReportEmptyStateProps {
    overall: number;      // org-wide report count, regardless of current filters/search
    hasProjects: boolean; // whether at least one project exists to generate a report for
}


// Admin-only page — no role branching needed here.
const ReportEmptyState = ({ overall, hasProjects }: ReportEmptyStateProps) => {
    // Filtered/searched to nothing — reports exist somewhere, just not
    // under the current query.
    if (overall > 0) {
        return (
            <div className="w-full bg-gray-50 rounded-md">
                <EmptyState
                    variant="empty"
                    title="No Record Found"
                    description="No reports match your current filters."
                />
            </div>
        );
    }

    // Truly no reports yet, and nothing exists to report on either —
    // the actual blocker is upstream, at the project level.
    if (!hasProjects) {
        return (
            <div className="w-full bg-gray-50 rounded-md flex flex-col items-center justify-center text-center px-6 py-16">
                <EmptyState
                    variant="report"
                    title="No Projects to Report On"
                    description={
                        <p className="text-md text-gray-400 mt-1 max-w-sm">
                            Reports are generated for a specific project. Create your first project before
                            generating a report.
                        </p>
                    }
                />

            </div>
        );
    }

    // Projects exist, but no report has been generated for any of them yet.
    return (
        <div className="w-full bg-gray-50 rounded-md flex flex-col items-center justify-center text-center px-6 py-16">
                <EmptyState
                    variant="report"
                    title="No Reports Generated Yet"
                    description={
                        <p className="text-md text-gray-400 mt-1 max-w-sm">
                            Use "Generate Report" above to create your first one for a project.
                        </p>
                    }
                />

        </div>
    );
};

export default ReportEmptyState;