import EmptyState from "../../../components/ui/empty";

interface AssistanceEmptyStateProps {
    overall: number; // org-wide assistance count, regardless of current filters/search
}

// This page is gated to admin-only at the route level (see App.tsx —
// assistanceAllowedRoles redirects anyone else away before this ever
// mounts), so unlike Projects/Members/Beneficiaries, there's no
// collaborator-facing branch to build here.
const AssistanceEmptyState = ({ overall }: AssistanceEmptyStateProps) => {
    if (overall > 0) {
        return (
            <div className="w-full bg-gray-50 rounded-md">
                <EmptyState variant="empty" title="No Record Found" />
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-50 rounded-md">
            <EmptyState
                variant="assistance"
                title="No Assistance Defined Yet"
                description={
                    <div className="mt-4 max-w-md mx-auto text-center space-y-3">
                        <p className="text-sm text-gray-500">
                            Assistance records represent what your organisation distributes to
                            beneficiaries, food, cash, school supplies, and more.
                        </p>
                        <p className="text-sm text-gray-500">
                            Make sure your <b>Assistance Types</b> are defined first, each assistance
                            record is tied to a type (e.g. "Food" measured in kg), then use the button
                            above to add your first one.
                        </p>
                        <p className="text-xs font-semibold">Start with "New Type" To define Assitance-Types</p>
                    </div>
                }
            />
        </div>
    );
};

export default AssistanceEmptyState;