import emptyImg from "../../../assets/icons/analytics.png";

interface AnalyticsEmptyStateProps {
    title?: string;
    description?: string;
}

const AnalyticsEmptyState = ({
    title = "No analytics data yet",
    description = "There's nothing to show for this selection. Everything here will start to tak shape when project will be created",
}: AnalyticsEmptyStateProps) => (
    <div className="flex flex-col items-center justify-center text-center px-6 py-20 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-center mb-4">
            <img src={emptyImg} className="size-16" />
        </div>
        <p className="text-2xl font-bold text-primary">{title}</p>
        <p className=" text-gray-400 mt-1 max-w-lg">{description}</p>
    </div>
);

export default AnalyticsEmptyState;