import { useEffect } from "react";
import { useDashboardStore } from "../store/dashbaordStore";
import Loading from "../../../components/ui/loading";
import StatusBadge from "../../../components/ui/status-badge";
import type { AttentionItem, ProjectProgress, RecentActivityItem } from "../dashbaord";
import fileImg from "../../../assets/icons/file.png";
import alertImg from "../../../assets/icons/urgent_message.png";
import type { BadgeColor } from "../../../types/badgeColor";
import type { TableColumn } from "../../../components/widgets/table";
import Table from "../../../components/widgets/table";

const statusColors: Record<string, { text: string; color: string }> = {
    pending: { text: "Pending", color: "gray" },
    ongoing: { text: "Ongoing", color: "blue" },
    overdue: { text: "Overdue", color: "red" },
    done: { text: "Done", color: "purple" },
    suspended: { text: "Suspended", color: "orange" },
};

const severityStyles: Record<string, { icon: string; iconBg: string; border: string }> = {
    CRITICAL: { icon: "text-red-600", iconBg: "bg-red-100", border: "border-red-100" },
    WARNING: { icon: "text-amber-600", iconBg: "bg-amber-100", border: "border-amber-100" },
    INFO: { icon: "text-gray-500", iconBg: "bg-gray-100", border: "border-gray-100" },
};

const timeAgo = (dateString: string): string => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMin = Math.round(diffMs / 60000);

    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin} min${diffMin !== 1 ? "s" : ""} ago`;

    const diffHr = Math.round(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;

    const diffDay = Math.round(diffHr / 24);
    return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
};

const projectColumns: TableColumn[] = [
    { key: "name", label: "Project", visibleOn: "always", render: (row: ProjectProgress) => 
         (
            <div className="">
                <p className="text-md text-gray-800">{row.name}</p>
                <div className="flex space-x-2">
                    <p className="font-semibold text-gray-500">{row.familiesRegistered} Beneficiaries</p>
                    <p>-</p>
                    <p className="font-semibold text-gray-500">{row.deliveriesCompleted} Deliveries</p>
                </div>
            </div>
        ),
     },
    {
        key: "progressPercentage",
        label: "Progress",
        visibleOn: "md",
        render: (row) => (
            <div className="flex items-center gap-2 w-32">
                <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full" style={{ width: `${row.progressPercentage}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-500 w-9 text-right">{row.progressPercentage}%</span>
            </div>
        ),
    },
    {
        key: "daysLeft",
        label: "Days Left",
        visibleOn: "sm",
        render: (row) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                row.daysLeft <= 7
                ? 'bg-red-100 text-red-800'
                : row.daysLeft <= 30
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}>
                {row.daysLeft === 0 ? "Overdue" : row.daysLeft} {row.daysLeft === 1 ? 'day' : row.daysLeft === 0 ? "" : 'days'}
            </span>
        ),
    },
    {
        key: "status",
        label: "Status",
        visibleOn: "always",
        render: (row) => (
            <StatusBadge
                text={statusColors[row.status]?.text || row.status}
                color={(statusColors[row.status]?.color || "gray") as BadgeColor}
            />
        ),
    },
];

// Turns a raw activity row into a natural sentence instead of a table row.
const entityLabel: Record<string, string> = {
    beneficiary: "a beneficiary record",
    delivery: "a delivery",
    sync: "field data",
};

const actionVerb: Record<string, string> = {
    Synched: "synced",
    Approved: "approved",
    Created: "created",
    Updated: "updated",
    Rejected: "rejected",
    Deleted: "deleted",
};

const article = (word: string) => (/^[aeiou]/i.test(word) ? "An" : "A");

const activityPhrase = (item: RecentActivityItem): string => {
    const verb = actionVerb[item.action] || item.action.toLowerCase();
    const object = item.entity_type === "sync" ? "field data" : (entityLabel[item.entity_type] || `a ${item.entity_type} record`);
    return `${article(item.actor_role)} ${item.actor_role} ${verb} ${object}`;
};

const AttentionCard = ({ item }: { item: AttentionItem }) => {
    const styles = severityStyles[item.severity] || severityStyles.INFO;

    return (
        <div className={`p-4 rounded-lg border ${styles.border} bg-white`}>
            <div className="flex items-start gap-3">
                <div className={`size-9 rounded-full flex items-center justify-center flex-shrink-0 ${styles.iconBg}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-5 ${styles.icon}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{item.message}</p>

                    {item.projects && item.projects.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {item.projects.map((p: any) => (
                                <p key={p.id} className="text-xs text-gray-500">
                                    {p.name} <span className="text-gray-400">— ends {p.end_date}</span>
                                </p>
                            ))}
                        </div>
                    )}

                    {item.action && (
                        <button
                            // NOTE: wiring this to real navigation depends on your router setup,
                            // which I haven't seen — swap this for your navigate/route logic.
                            onClick={() => console.log("Navigate to:", item.action.target)}
                            className="text-xs font-semibold text-primary hover:underline mt-2 inline-block"
                        >
                            {item.action.label} →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminDashbaord = () => {
    const { adminOverview, loading, getAdminOverview } = useDashboardStore();

    useEffect(() => {
        getAdminOverview();
    }, [getAdminOverview]);

    if (loading && !adminOverview) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loading text="Loading dashboard..." />
            </div>
        );
    }

    if (!adminOverview) {
        return null;
    }

    const { executive_snapshot, attention_required, project_overview, recent_activity } = adminOverview;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mt-1">Overview of your organization's activities</p>
                </div>
            </div>

            {/* Executive Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: "Active Projects", value: executive_snapshot.active_projects,
                        icon: (
                            <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                            </svg>
                        ),
                    },
                    {
                        label: "Beneficiaries", value: executive_snapshot.beneficiaries,
                        icon: (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        ),
                    },
                    {
                        label: "Deliveries", value: executive_snapshot.deliveries,
                        icon: (
                            <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m7.875 14.25 1.214 1.942a2.25 2.25 0 0 0 1.908 1.058h2.006c.776 0 1.497-.4 1.908-1.058l1.214-1.942M2.41 9h4.636a2.25 2.25 0 0 1 1.872 1.002l.164.246a2.25 2.25 0 0 0 1.872 1.002h2.092a2.25 2.25 0 0 0 1.872-1.002l.164-.246A2.25 2.25 0 0 1 16.954 9h4.636M2.41 9a2.25 2.25 0 0 0-.16.832V12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 12V9.832c0-.287-.055-.57-.16-.832M2.41 9a2.25 2.25 0 0 1 .382-.632l3.285-3.832a2.25 2.25 0 0 1 1.708-.786h8.43c.657 0 1.281.287 1.709.786l3.284 3.832c.163.19.291.404.382.632M4.5 20.25h15A2.25 2.25 0 0 0 21.75 18v-2.625c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125V18a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                        ),
                    },
                    {
                        label: "Pending Review", value: executive_snapshot.pending_review,
                        icon: (
                            <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        ),
                    },
                ].map((card) => (
                    <div key={card.label} className="bg-gray-100 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-700">{card.label}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                            </div>
                            <div className="bg-primary rounded-full p-3">{card.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Attention Required */}
            {attention_required.length > 0 && (
                <div>
                    <p className="text-sm font-bold text-gray-700 mb-3">Needs Your Attention</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {attention_required.map((item, idx) => (
                            <AttentionCard key={idx} item={item} />
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col space-x-0 space-y-4 md:space-y-0 md:space-x-4 md:flex-row w-full">
                {/* Project Overview */}
                {project_overview.length === 0 ? (
                    <div className="flex justify-center items-center w-full md:w-[60%] min-h-[40vh] bg-muted/40">
                        <div className="text-center">
                            <img src={fileImg} alt="No projects" className="size-16 mx-auto" />
                            <p className="text-lg text-primary font-bold">No Project Progress</p>
                            <p className="text-sm text-gray-400">For now no project has been created</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full md:w-[60%] p-0 overflow-auto">
                        <p className="text-sm font-bold text-gray-700 mb-3">Project Overview</p>
                        <Table columns={projectColumns} data={project_overview} />
                    </div>
                )}

                {/* Recent Activity — phrases, not a table */}
                {recent_activity.length === 0 ? (
                    <div className="flex justify-center items-center w-full md:w-[40%] min-h-[40vh] p-2 overflow-auto space-y-2 bg-muted/40 rounded-sm">
                        <div className="text-center">
                            <img src={alertImg} alt="No activity" className="size-16 mx-auto" />
                            <p className="text-lg text-primary font-bold">No Recent Activity</p>
                            <p className="text-sm text-gray-400">Field and validation activity will show up here</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full md:w-[40%] p-2 overflow-auto border border-gray-100 rounded-sm">
                        <p className="text-sm font-bold text-gray-700 mb-3 px-2 pt-1">Recent Activity</p>
                        <div className="divide-y divide-gray-50">
                            {recent_activity.map((item) => (
                                <div key={item.id} className="flex items-start gap-3 px-2 py-2.5">
                                    <span className="size-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                                    <div className="min-w-0">
                                        <p className="text-sm text-gray-700">{activityPhrase(item)}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(item.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashbaord;