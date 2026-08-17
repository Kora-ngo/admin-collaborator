import { useAuthStore } from "../../auth/store/authStore";
import EmptyState from "../../../components/ui/empty";

interface AuditLogEmptyStateProps {
    overall: number;      // true all-time count — NOT scoped to today's default window
    isFiltering: boolean; // true if the person has an active search term or a non-default filter applied
}

const pulseIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.012 1.244h3.22a2.25 2.25 0 0 0 2.012-1.244l.256-.512a2.25 2.25 0 0 1 2.012-1.244h3.86" />
    </svg>
);

const clockIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7 text-primary">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const RoleItem = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex-shrink-0 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            {icon}
        </span>
        <p className="text-sm text-gray-500">{children}</p>
    </div>
);

const AuditLogEmptyState = ({ overall, isFiltering }: AuditLogEmptyStateProps) => {
    const { role } = useAuthStore();
    const isAdmin = role === "admin";

    // State 1: nothing has ever been logged, org-wide.
    if (overall === 0) {
        return (
            <div className="w-full bg-gray-50 rounded-md">
                <EmptyState
                    variant="audit"
                    title="No Activity Logged Yet"
                    description={
                        <div className="mt-4 max-w-md mx-auto text-left space-y-3">
                            <p className="text-sm text-gray-500">
                                Audit logs aren't created manually every record created, updated, or
                                delivered anywhere in Kora is logged here automatically as it happens.
                            </p>
                            <RoleItem icon={pulseIcon}>
                                {isAdmin
                                    ? "Once your team starts working, registering families, approving deliveries, adding members  activity will appear here in real time."
                                    : "You'll see activity related to the projects and team members within your supervision as it happens."}
                            </RoleItem>
                        </div>
                    }
                />
            </div>
        );
    }

    // State 2: an active search or filter matched nothing. Data exists,
    // this specific query just didn't find any of it.
    if (isFiltering) {
        return (
            <div className="w-full bg-gray-50 rounded-md">
                <EmptyState
                    variant="empty"
                    title="No Record Found"
                    description="No activity matches your current search or filters. Try adjusting or clearing them."
                />
            </div>
        );
    }

    // State 3: default view (today) is quiet, but history exists.
    return (
        <div className="w-full bg-gray-50 rounded-md flex flex-col items-center justify-center text-center px-6 py-16">

                <EmptyState
                    variant="audit"
                    title="Nothing Logged Today"
                    description={
                                    <p className="text-md text-gray-400 mt-1 max-w-sm">
                No activity has happened yet today. Switch the filter to{" "}
                 to see earlier history.
            </p>
                    }
                />

        </div>
    );
};

export default AuditLogEmptyState;