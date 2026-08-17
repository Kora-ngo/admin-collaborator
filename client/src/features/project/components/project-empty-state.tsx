import { useAuthStore } from "../../auth/store/authStore";
import EmptyState from "../../../components/ui/empty";

interface ProjectEmptyStateProps {
    overall: number; // org-wide project count, regardless of current filters/search
}

const CheckItem = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex-shrink-0 size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
        </span>
        <p className="text-sm text-gray-500">{children}</p>
    </div>
);

const ProjectEmptyState = ({ overall }: ProjectEmptyStateProps) => {
    const { role } = useAuthStore();

    // Filtered/searched to nothing — projects exist somewhere, just not
    // under the current filter. Same message regardless of role, since it's
    // not about onboarding, it's about the current query.
    if (overall > 0) {
        return (
            <div className="w-full bg-gray-50 rounded-md">
                <EmptyState variant="empty" title="No Record Found" />
            </div>
        );
    }

    // Truly empty — nothing exists yet anywhere in the org. What we tell
    // the person depends on whether they can actually do anything about it.
    const isAdmin = role === "admin";

    return (
        <div className="w-full bg-gray-50 rounded-md">
            <EmptyState
                variant="project"
                title="No Projects Yet"
                description={
                    isAdmin ? (
                        <div className="mt-4 max-w-md mx-auto text-left space-y-3">
                            <p className="text-sm font-semibold text-gray-700">
                                Get this space ready before creating your first project:
                            </p>
                            <div className="space-y-2">
                                <CheckItem>
                                    At least one <b>Collaborator</b> and one <b>Enumerator</b> added under <b>Members</b>
                                </CheckItem>
                                <CheckItem>
                                    Your <b>Assistance Types</b> defined under <b>Assistance</b> needed when recording deliveries
                                </CheckItem>
                            </div>
                            <p className="text-xs text-gray-400 pt-1">
                                Once that's in place, use "New Project" above to create your first one.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-4 max-w-md mx-auto text-center space-y-2">
                            <p className="text-md text-gray-500">
                                No projects have been created for your organization yet.
                            </p>
                            <p className="text-sm text-gray-500">
                                Reach out to your <b>organization admin</b> to get one started. Once a project exists, it'll show up here.
                            </p>
                        </div>
                    )
                }
            />
        </div>
    );
};

export default ProjectEmptyState;