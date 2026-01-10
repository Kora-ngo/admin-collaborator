import { useEffect, useState } from "react";
import { ActionButton } from "../../components/widgets/action-button";
import ActionIcon from "../../components/widgets/action-icon";
import { Button } from "../../components/widgets/button";
import { FilterToggleButton } from "../../components/widgets/filter-button";
import SearchInput from "../../components/widgets/search-input";
import StatusBadge from "../../components/widgets/status-badge";
import type { TableColumn } from "../../components/widgets/table";
import Table from "../../components/widgets/table";
import Modal from "../../components/widgets/modal";
import ProjectForm from "../../features/project/components/project-form";
// import ProjectView from "../../features/project/components/project-view";
import { useProjectStore } from "../../features/project/store/projectStore";
import { formatDate } from "../../utils/formatDate";
import EmptyState from "../../components/widgets/empty";
import Loading from "../../components/widgets/loading";
import Popup from "../../components/widgets/popup";
import { useProject } from "../../features/project/hooks/useProject";
import { SelectInput } from "../../components/widgets/select-input";
import ProjectView from "../../features/project/components/project-view";
import ProjectActionPopup from "../../features/project/components/ProjectActionPopup";
import ProjectViewMedia from "../../features/project/components/project-view-media";

type ModalMode = 'add' | 'edit' | 'view' | null;

const Projects = () => {
    const { data, getData, pagination, loading } = useProjectStore();
    const {
        filters,
        filterMode,
        toggleFilter,
        handleStatusChange,
        searchTerm,
        handleSearch,
        refreshCurrentPage,
        handleToggle,
        handleDatePresetChange,
        handleStatusUpdate,
        handleView
    } = useProject();

    const [mediaPreviewOpen, setMediaPreviewOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<any[]>([]);


    const [actionPopup, setActionPopup] = useState(false);
    const [deletePopup, setDeletePopUp] = useState(false);
    const [projectModalMode, setProjectModalMode] = useState<ModalMode>(null);
    const [selectedRecord, setSelectedRecord] = useState<{
        id: number;
        name: string;
        status: string;
    } | null>(null);

    const handleActionConfirm = async (action: string) => {
        if (!selectedRecord) return;

        let success = false;

        if (action === 'delete') {
            success = await handleToggle(selectedRecord.id, selectedRecord.status);
        } else {
            // Update status to 'done' or 'suspended'
            success = await handleStatusUpdate(selectedRecord.id, action);
        }

        if (success) {
            setActionPopup(false);
            setSelectedRecord(null);
            await refreshCurrentPage(pagination!.page);
        }
    };

    const openMediaPreview = (project: any) => {
        if (project.mediaLinks?.length > 0) {
            setSelectedMedia(project.mediaLinks);
            setMediaPreviewOpen(true);
        }
    };

    const closeMediaPreview = () => {
        setMediaPreviewOpen(false);
        setSelectedMedia([]);
    };

    const openProjectModal = async (mode: 'add' | 'edit' | 'view', id?: number) => {
        if (mode === 'add') {
            setProjectModalMode('add');
            setSelectedRecord(null);
            return;
        }

        if (!id) return;

        const fullRecord = await handleView(id);

        setSelectedRecord({
            id,
            name: fullRecord.name,
            status: fullRecord.status,
        });

        setProjectModalMode(mode);
    };

    const closeProjectModal = () => {
        setProjectModalMode(null);
        setSelectedRecord(null);
    };

    const openActionPopup = (project: any) => {
        setSelectedRecord({
            id: project.id,
            name: project.name,
            status: project.status
        });
        setActionPopup(true);
    };

    useEffect(() => {
        getData();
    }, [getData]);

    const projectColumns: TableColumn[] = [
        { 
            key: "id", 
            label: "ID", 
            visibleOn: "always", 
            render: (row) => `#PRJ-${row.id}` 
        },
        { 
            key: "name", 
            label: "Project Title", 
            visibleOn: "always" 
        },
        {
            key: "assistances",
            label: "Assistances",
            visibleOn: "md",
            render: (row) => `${ row.assistances?.length || 0} Assistances`
        },
        {
            key: "members",
            label: "Members",
            visibleOn: "lg",
            render: (row) => {
                const enumerators = row.members?.filter((m: any) => 
                    m.role_in_project === 'enumerator'
                ).length || 0;
                const collaborators = row.members?.filter((m: any) => 
                    m.role_in_project === 'collaborator'
                ).length || 0;
                return `${enumerators}Enums, ${collaborators}Colls`;
            }
        },
        {
            key: "start_date",
            label: "Start",
            visibleOn: "md",
            render: (row) => formatDate(row.start_date, false)
        },
        {
            key: "end_date",
            label: "End",
            visibleOn: "md",
            render: (row) => formatDate(row.end_date, false)
        },
        {
            key: "status",
            label: "Status",
            visibleOn: "always",
            render: (row) => {
                const statusColors: any = {
                    pending: { text: "Pending", color: "gray" },
                    ongoing: { text: "Ongoing", color: "blue" },
                    done: { text: "Done", color: "green" },
                    suspended: { text: "Suspended", color: "orange" },
                    overdue: { text: "Overdue", color: "red" },
                    false: { text: "Deleted", color: "red" }
                };
                const s = statusColors[row.status] || statusColors.pending;
                return <StatusBadge text={s.text} color={s.color} />;
            }
        },
        {
            key: "action",
            label: "Action",
            visibleOn: "always",
            render: (row) => {
                if (row.status === 'false') {
                    return (
                        <div className="flex items-center space-x-3">
                            <ActionIcon name="restore"
                                onClick={() => {
                                    setSelectedRecord({
                                        id: row.id,
                                        name: row.name,
                                        status: row.status
                                    });
                                    setDeletePopUp(true);
                                }}
                            />
                        </div>
                    );
                }

                return (
                    <div className="flex items-center space-x-3">
                        <ActionIcon name="edit"
                            onClick={() => openProjectModal('edit', row.id)}
                        />
                        <ActionIcon name="view"
                            onClick={() => openProjectModal('view', row.id)}
                        />
                        {
                            row.status === "done" ? 
                            <ActionIcon name="disable" />:
                            <ActionIcon name="setting"
                                onClick={() => openActionPopup(row)}
                            />
                        }

                        {
                            row.mediaLinks?.length > 0 ? (
                                    <ActionIcon
                                        name="attach"
                                        onClick={() => openMediaPreview(row)}
                                    />
                                ) : (
                                    <></>
                                )
                        }
                        
                    </div>
                );
            }
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 mt-2">
            <div className="flex flex-col items-start justify-start rounded-sm bg-white gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <div className="w-full sm:w-64 lg:w-80">
                            <SearchInput
                                placeholder="Search for project name"
                                className="w-full sm:w-64 lg:w-80"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <FilterToggleButton isOpen={filterMode} onToggle={toggleFilter} />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <ActionButton onClick={() => refreshCurrentPage(pagination?.page!)} />
                        <Button className="w-full" onClick={() => openProjectModal('add')}>
                            New Project
                        </Button>
                    </div>
                </div>

                {filterMode && (
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg w-full">
                        <div className="w-50">
                            <SelectInput
                                options={[
                                    { label: "All Status", value: "" },
                                    { label: "Pending", value: "pending" },
                                    { label: "Ongoing", value: "ongoing" },
                                    { label: "Done", value: "done" },
                                    { label: "Suspended", value: "suspended" },
                                    { label: "Overdue", value: "overdue" },
                                    { label: "Deleted", value: "false" },
                                ]}
                                value={filters.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                            />
                        </div>

                        <div className="w-50">
                            <SelectInput
                                options={[
                                    { label: "All Time", value: "all" },
                                    { label: "Today", value: "today" },
                                    { label: "This Week", value: "this_week" },
                                    { label: "This Month", value: "this_month" },
                                    { label: "This Year", value: "this_year" },
                                ]}
                                value={filters.datePreset}
                                onChange={(e) => handleDatePresetChange(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="w-[75vw] mt-20">
                        <Loading text="Please wait..." />
                    </div>
                ) : (
                    <>
                        {data.length === 0 ? (
                            <div className="w-full bg-gray-50 rounded-md">
                                <EmptyState title="No Record Found" />
                            </div>
                        ) : (
                            <>
                                <Table
                                    columns={projectColumns}
                                    data={data}
                                    className=""
                                />

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
                                                                <span className="flex items-center justify-center px-3 h-8 border border-gray-300 text-gray-500">
                                                                    ...
                                                                </span>
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

                        {filterMode && filters.status === "false" && (
                            <div className="col-span-1 sm:col-span-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800 font-medium">
                                    <span className="font-bold">Notice:</span> Deleted records will be permanently removed after 7 days.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Modal
                className={projectModalMode ===  "view" ? "lg:w-[630px]" : ""}
                isOpen={projectModalMode !== null}
                onClose={closeProjectModal}
                title={
                    projectModalMode === 'add' ? "New Project" :
                        projectModalMode === 'view' ? "View Project" :
                            "Edit Project"
                }
                children={
                    projectModalMode === 'add' || projectModalMode === 'edit' ? (
                        <ProjectForm
                            id={selectedRecord != null ? selectedRecord!.id : undefined}
                            isOpen={projectModalMode !== null}
                            onSuccess={() => {
                                getData();
                                closeProjectModal();
                            }}
                        />
                    ) : (
                        <ProjectView
                            isOpen={projectModalMode === 'view'}
                            id={selectedRecord != null ? selectedRecord!.id! : 0}
                        />
                    )
                }
            />


            {/* Media Preview Modal */}
            <Modal
                isOpen={mediaPreviewOpen}
                onClose={closeMediaPreview}
                title={`Media Attachments - ${selectedRecord?.name || "Project"}`}
                children={
                    <ProjectViewMedia 
                        mediaLinks={selectedMedia} // from your selectedMedia state
                    />
                }
            />

            <ProjectActionPopup
                open={actionPopup}
                onClose={() => {
                    setActionPopup(false);
                    setSelectedRecord(null);
                }}
                projectStatus={selectedRecord?.status || ''}
                projectName={selectedRecord?.name || ''}
                onConfirm={handleActionConfirm}
            />

            

            <Popup
                open={deletePopup}
                onClose={() => setDeletePopUp(false)}
                title={selectedRecord?.status !== "false" ? "Delete Project" : "Restore Project"}
                description={
                    selectedRecord ? (
                        <>
                            You are about to <strong>{selectedRecord.status !== "false" ? "delete" : "restore"} </strong>
                            the project <span className="font-bold">{selectedRecord.name}</span>.
                            Do you want to proceed?
                        </>
                    ) : "Loading..."
                }
                confirmText={selectedRecord?.status !== "false" ? "Delete" : "Restore"}
                cancelText="Cancel"
                onConfirm={async () => {
                    if (!selectedRecord) return;

                    const success = await handleToggle(selectedRecord.id, selectedRecord.status);
                    if (success) {
                        setDeletePopUp(false);
                        setSelectedRecord(null);
                        await refreshCurrentPage(pagination!.page);
                    }
                }}
                confirmButtonClass={
                    selectedRecord?.status !== "false"
                        ? "bg-red-500 hover:bg-red-400"
                        : "bg-accent hover:bg-accent/80"
                }
            />
        </div>
    );
}

export default Projects;
