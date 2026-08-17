import { useAuthStore } from "../../auth/store/authStore";
import EmptyState from "../../../components/ui/empty";

interface MembershipEmptyStateProps {
    overall: number; // org-wide member count, regardless of current filters/search
}

const RoleItem = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex-shrink-0 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            {icon}
        </span>
        <p className="text-sm text-gray-500">{children}</p>
    </div>
);

const desktopIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
    </svg>
);

const mobileIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
);

const MembershipEmptyState = ({ overall }: MembershipEmptyStateProps) => {
    const { role } = useAuthStore();

    // Filtered/searched to nothing — members exist somewhere, just not under
    // the current filter. Same message regardless of role.
    if (overall > 0) {
        return (
            <div className="w-full bg-gray-50 rounded-md">
                <EmptyState variant="empty" title="No Record Found" />
            </div>
        );
    }

    const isAdmin = role === "admin";

    return (
        <div className="w-full bg-gray-50 rounded-md">
            <EmptyState
                variant="member"
                title={isAdmin ? "No Members Yet" : "No Enumerators Assigned Yet"}
                description={
                    isAdmin ? (
                        <div className="mt-4 max-w-md mx-auto text-left space-y-3">
                            <p className="text-sm font-semibold text-gray-700">
                                This is where everything starts.
                            </p>
                            <p className="text-sm text-gray-500">
                                Create members for your organisation and assign them as{" "}
                                <b>Collaborators</b> and/or <b>Enumerators</b>.
                            </p>
                            <div className="space-y-2 pt-1">
                                <RoleItem icon={desktopIcon}>
                                    <b>Collaborators</b> get their own dashboard, accessible via{" "}
                                    <span className="text-primary font-medium">kora.onl/space</span>
                                </RoleItem>
                                <RoleItem icon={mobileIcon}>
                                    <b>Enumerators</b> work in the field via the mobile app{" "}
                                    <span className="text-primary font-medium">Kora Field</span>
                                </RoleItem>
                            </div>
                            <p className="text-xs text-gray-400 pt-1">
                                Use "New User" above to add your first member.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-4 max-w-md mx-auto text-center space-y-2">
                            <p className="text-md font-semibold text-gray-700">
                                This module is managed by your administrator.
                            </p>
                            <p className="text-sm text-gray-500">
                                Only enumerators assigned to a project within your supervision will appear here.
                            </p>
                            <p className="text-sm font-semibold text-gray-500">
                                No action is required from you.
                            </p>
                        </div>
                    )
                }
            />
        </div>
    );
};

export default MembershipEmptyState;