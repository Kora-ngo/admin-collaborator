import EmptyState from "../../../components/ui/empty";

interface AnalyticsEmptyStateProps {
    title?: string;
    description?: string;
}

// This page is gated to admin-only at the route level (same
// assistanceAllowedRoles guard as /assistance in App.tsx), so there's no
// collaborator-facing variant to build here.
const AnalyticsEmptyState = ({
    title = "Nothing to Analyze Yet",
}: AnalyticsEmptyStateProps) => (

 <div className="w-full bg-gray-50 rounded-md">
            <EmptyState
                variant="analytics"
                title={title}
                description={
                        <div className="mt-4 max-w-md mx-auto text-center space-y-3">
                            <p className="text-sm text-gray-500">
                                Analytics only has something to show once a project exists and starts generating activity, beneficiaries, deliveries, or validation records. Head to <b>Projects</b> to create your first one
                            </p>
                        </div>
                }
            />
        </div>


    // <div className="flex flex-col items-center justify-center text-center px-6 py-20 bg-gray-50 rounded-xl">
    //     <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
    //         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7 text-primary">
    //             <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    //         </svg>
    //     </div>
    //     <p className="text-base font-bold text-gray-800">{title}</p>
    //     <p className="text-sm text-gray-400 mt-1 max-w-sm">{description}</p>
    // </div>
);

export default AnalyticsEmptyState;