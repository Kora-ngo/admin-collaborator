import { useAuthStore } from "../../auth/store/authStore";
import EmptyState from "../../../components/ui/empty";

interface DeliveryEmptyStateProps {
    overall: number; // org-wide delivery count, regardless of current filters/search
}

const mobileIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
);

const syncIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
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

const DeliveryEmptyState = ({ overall }: DeliveryEmptyStateProps) => {
    const { role } = useAuthStore();

    // Filtered/searched to nothing — records exist somewhere, just not
    // under the current filter. Same message regardless of role.
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
                variant="delivery"
                title={isAdmin ? "No Deliveries Yet" : "No Deliveries Synched Yet"}
                description={
                    isAdmin ? (
                        <div className="mt-4 max-w-md mx-auto text-left space-y-3">
                            <p className="text-sm text-gray-500">
                                Delivery records aren't created here they're logged in the field by{" "}
                                <b>Enumerators</b> through the mobile app and synced back for review.
                            </p>
                            <div className="space-y-2 pt-1">
                                <RoleItem icon={mobileIcon}>
                                    Assign at least one <b>Enumerator</b> to an active project via{" "}
                                    <span className="text-primary font-medium">Kora Field</span>
                                </RoleItem>
                                <RoleItem icon={syncIcon}>
                                    Once deliveries are logged, they'll appear here automatically after syncing
                                </RoleItem>
                            </div>
                            <p className="text-xs font-semibold text-gray-400 pt-1">
                                No manual creation is needed on this dashboard.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-4 max-w-md mx-auto text-center space-y-2">
                            <p className="text-sm text-gray-500">
                                Records will appear here once <b>Enumerators</b> under your supervision
                                log and sync delivery data from the field.
                            </p>
                            <p className="text-sm font-semibold text-gray-500">
                                Only synched and approved beneficiaries will be avaible for deliveries on the enumerators's project
                            </p>
                        </div>
                    )
                }
            />
        </div>
    );
};

export default DeliveryEmptyState;