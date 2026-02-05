// src/features/audit/audit-logs.tsx

import { useEffect, useState } from "react";
import { ActionButton } from "../../components/widgets/action-button";
import { FilterToggleButton } from "../../components/widgets/filter-button";
import SearchInput from "../../components/widgets/search-input";
import StatusBadge from "../../components/widgets/status-badge";
import type { TableColumn } from "../../components/widgets/table";
import Table from "../../components/widgets/table";
import Modal from "../../components/widgets/modal";
import { formatDate } from "../../utils/formatDate";
import EmptyState from "../../components/widgets/empty";
import Loading from "../../components/widgets/loading";
import { SelectInput } from "../../components/widgets/select-input";
import { useAuditLogStore } from "../../features/audit/store/auditLogStore";
import { useAuditLog } from "../../features/audit/hooks/useAuditLog";
import AuditLogView from "../../features/audit/components/audit-log-view";
import ActionIcon from "../../components/widgets/action-icon";

const AuditLogs = () => {
    const { data, getData, pagination, loading } = useAuditLogStore();
    const {
        searchTerm,
        handleSearch,
        filterMode,
        toggleFilter,
        filters,
        handleEntityTypeChange,
        handleActorRoleChange,
        handlePlatformChange,
        handleDatePresetChange,
        refreshCurrentPage
    } = useAuditLog();

    const [viewModal, setViewModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState<any>(null);

    useEffect(() => {
        getData();
    }, [getData]);

    const getActionColor = (action: string) => {
        if (action.includes('created') || action.includes('login')) return 'green';
        if (action.includes('approved')) return 'blue';
        if (action.includes('rejected') || action.includes('deleted')) return 'red';
        if (action.includes('updated') || action.includes('edited')) return 'yellow';
        return 'gray';
    };

    const getRoleBadgeColor = (role: string) => {
        if (role === 'admin') return 'purple';
        if (role === 'collaborator') return 'blue';
        if (role === 'enumerator') return 'green';
        return 'gray';
    };

    const auditLogColumns: (TableColumn | null)[] = [
 
        {
            key: "actor",
            label: "Actor",
            visibleOn: "always",
            render: (row) => (
                <div>
                    <p className="font-medium">{row.actor?.user?.name || "Unknown"}</p>
                </div>
            )
        },
        {
            key: "role",
            label: "Role",
            visibleOn: "always",
            render: (row) => (
                <div>
                    <StatusBadge
                        text={row.actor_role}
                        color={getRoleBadgeColor(row.actor_role)}
                    />
                </div>
            )
        },
        {
            key: "action",
            label: "Action",
            visibleOn: "always",
            render: (row) => (
                <StatusBadge
                    text={row.action}
                    color={getActionColor(row.action)}
                />
            )
        },
        {
            key: "entity_type",
            label: "Module",
            visibleOn: "md",
            render: (row) => (
                <span>{row.entity_type.toString().toUpperCase()}</span>
            )
        },
        {
            key: "platform",
            label: "Platform",
            visibleOn: "lg",
            render: (row) => (
                <StatusBadge
                    text={row.platform}
                    color={row.platform === 'web' ? 'blue' : 'green'}
                />
            )
        },
        {
            key: "created_at",
            label: "Created At",
            visibleOn: "always",
            render: (row) => formatDate(row.created_at, true)
        },
        {
            key: "action_col",
            label: "Details",
            visibleOn: "always",
            render: (row) => (
                    <ActionIcon name="view" onClick={() => {
                        setSelectedLog(row);
                        setViewModal(true);
                    }} />
                    )
                    }
                    ];
                    return (
                        <div className="grid grid-cols-1 gap-4 mt-2">
                            <div className="flex flex-col items-start justify-start rounded-sm bg-white gap-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                        <div className="w-full sm:w-64 lg:w-80">
                                            <SearchInput
                                                placeholder="Search audit logs..."
                                                className="w-full sm:w-64 lg:w-80"
                                                value={searchTerm}
                                                onChange={(e) => handleSearch(e.target.value)}
                                            />
                                        </div>
                                        <FilterToggleButton isOpen={filterMode} onToggle={toggleFilter} />
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                        <ActionButton onClick={() => refreshCurrentPage(pagination?.page || 1)} />
                                    </div>
                                </div>

                                {filterMode && (
                                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg w-full flex-wrap">
                                        <div className="w-full sm:w-auto flex-1 min-w-[200px]">
                                            <SelectInput
                                                options={[
                                                    { label: "All Entities", value: "" },
                                                    { label: "Auth", value: "auth" },
                                                    { label: "Beneficiary", value: "beneficiary" },
                                                    { label: "Delivery", value: "delivery" },
                                                    { label: "Project", value: "project" },
                                                    { label: "User", value: "user" },
                                                    { label: "Sync", value: "sync" }
                                                ]}
                                                value={filters.entityType}
                                                onChange={(e) => handleEntityTypeChange(e.target.value)}
                                            />
                                        </div>

                                        <div className="w-full sm:w-auto flex-1 min-w-[200px]">
                                            <SelectInput
                                                options={[
                                                    { label: "All Roles", value: "" },
                                                    { label: "Admin", value: "admin" },
                                                    { label: "Collaborator", value: "collaborator" },
                                                    { label: "Enumerator", value: "enumerator" }
                                                ]}
                                                value={filters.actorRole}
                                                onChange={(e) => handleActorRoleChange(e.target.value)}
                                            />
                                        </div>

                                        <div className="w-full sm:w-auto flex-1 min-w-[200px]">
                                            <SelectInput
                                                options={[
                                                    { label: "All Platforms", value: "" },
                                                    { label: "Web", value: "web" },
                                                    { label: "Mobile", value: "mobile" }
                                                ]}
                                                value={filters.platform}
                                                onChange={(e) => handlePlatformChange(e.target.value)}
                                            />
                                        </div>

                                        <div className="w-full sm:w-auto flex-1 min-w-[200px]">
                                            <SelectInput
                                                options={[
                                                    { label: "All Time", value: "all" },
                                                    { label: "Today", value: "today" },
                                                    { label: "This Week", value: "this_week" },
                                                    { label: "This Month", value: "this_month" },
                                                    { label: "This Year", value: "this_year" }
                                                ]}
                                                value={filters.datePreset}
                                                onChange={(e) => handleDatePresetChange(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {loading ? (
                                    <div className="w-[75vw] mt-20">
                                        <Loading text="Loading audit logs..." />
                                    </div>
                                ) : (
                                    <>
                                        {data.length === 0 ? (
                                            <div className="w-full bg-gray-50 rounded-md">
                                                <EmptyState
                                                    title="No Audit Logs Found"
                                                    description="No activity has been logged yet."
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <Table
                                                    columns={auditLogColumns}
                                                    data={data}
                                                    page={pagination?.page}
                                                    pageSize={pagination?.limit}
                                                />

                                                {/* Pagination */}
                                                <div className="flex flex-col sm:flex-row justify-between w-full gap-4 mt-1">
                                                    <div>
                                                        <p className="text-gray-500">
                                                            Total Records: <span className="font-bold text-black">{pagination?.total || 0}</span>
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <nav aria-label="Page navigation">
                                                            <ul className="inline-flex -space-x-px text-sm">
                                                                <li>
                                                                    <button
                                                                        disabled={!pagination?.hasPrev}
                                                                        onClick={() => refreshCurrentPage(pagination!.page - 1)}
                                                                        className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 rounded-s-lg ${
                                                                            !pagination?.hasPrev
                                                                                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                                                                                : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
                                                                        }`}
                                                                    >
                                                                        Previous
                                                                    </button>
                                                                </li>

                                                                {(() => {
                                                                    const total = pagination?.totalPages || 1;
                                                                    const current = pagination?.page || 1;
                                                                    const pages: (number | string)[] = [];

                                                                    pages.push(1);
                                                                    if (current > 3) pages.push("...");

                                                                    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
                                                                        if (!pages.includes(i)) pages.push(i);
                                                                    }

                                                                    if (current < total - 2) pages.push("...");
                                                                    if (total > 1) pages.push(total);

                                                                    return pages.map((page, index) =>
                                                                        page === "..." ? (
                                                                            <li key={`ellipsis-${index}`}>
                                                                                <span className="flex items-center justify-center px-3 h-8 border border-gray-300 text-gray-500">...</span>
                                                                            </li>
                                                                        ) : (
                                                                            <li key={page}>
                                                                                <button
                                                                                    onClick={() => refreshCurrentPage(page as number)}
                                                                                    className={`flex items-center justify-center px-3 h-8 border border-gray-300 ${
                                                                                        page === current
                                                                                            ? "text-primary bg-primary/10 font-medium"
                                                                                            : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
                                                                                    }`}
                                                                                >
                                                                                    {page}
                                                                                </button>
                                                                            </li>
                                                                        )
                                                                    );
                                                                })()}

                                                                <li>
                                                                    <button
                                                                        disabled={!pagination?.hasNext}
                                                                        onClick={() => refreshCurrentPage(pagination!.page + 1)}
                                                                        className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 rounded-e-lg ${
                                                                            !pagination?.hasNext
                                                                                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                                                                                : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
                                                                        }`}
                                                                    >
                                                                        Next
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </nav>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* View Modal */}
                            <Modal
                                isOpen={viewModal}
                                onClose={() => {
                                    setViewModal(false);
                                    setSelectedLog(null);
                                }}
                                title="Audit Log Details"
                            >
                                <AuditLogView log={selectedLog} />
                            </Modal>
                        </div>
                    );
                    };

                    export default AuditLogs;
