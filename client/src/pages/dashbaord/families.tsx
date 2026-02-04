import { useEffect, useState } from "react";
import { ActionButton } from "../../components/widgets/action-button";
import ActionIcon from "../../components/widgets/action-icon";
import { FilterToggleButton } from "../../components/widgets/filter-button";
import SearchInput from "../../components/widgets/search-input";
import StatusBadge from "../../components/widgets/status-badge";
import type { TableColumn } from "../../components/widgets/table";
import Table from "../../components/widgets/table";
import Modal from "../../components/widgets/modal";
import { formatDate } from "../../utils/formatDate";
import EmptyState from "../../components/widgets/empty";
import Loading from "../../components/widgets/loading";
import Popup from "../../components/widgets/popup";
import { SelectInput } from "../../components/widgets/select-input";
import { Textarea } from "../../components/widgets/textarea";
import { useBeneficiaryStore } from "../../features/family/store/beneficiaryStore";
import { useAuthStore } from "../../features/auth/store/authStore";
import { useBeneficiary } from "../../features/family/hooks/useBeneficiary";
import BeneficiaryView from "../../features/family/components/beneficiary-view";

type ModalMode = 'view' | 'review' | null;

const Families = () => {
    const { data, getData, pagination, loading } = useBeneficiaryStore();
    const { membership } = useAuthStore();
    const {
        searchTerm,
        handleSearch,
        filterMode,
        toggleFilter,
        filters,
        handleReviewStatusChange,
        handleDatePresetChange,
        refreshCurrentPage,
        handleView,
        handleReview
    } = useBeneficiary();

    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [reviewPopup, setReviewPopup] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<{
        id: number;
        family_code: string;
        head_name: string;
        review_status: string;
    } | null>(null);
    const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
    const [reviewNote, setReviewNote] = useState("");

    const isCollaborator = membership?.role === 'collaborator';

    useEffect(() => {
        getData();
    }, [getData]);

    const openModal = async (mode: 'view' | 'review', id: number) => {
        const fullRecord = await handleView(id);

        setSelectedRecord({
            id,
            family_code: fullRecord.family_code,
            head_name: fullRecord.head_name,
            review_status: fullRecord.review_status
        });

        setModalMode(mode);
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedRecord(null);
        setReviewNote("");
    };

    const openReviewPopup = (record: any, action: 'approve' | 'reject') => {
        setSelectedRecord({
            id: record.id,
            family_code: record.family_code,
            head_name: record.head_name,
            review_status: record.review_status
        });
        setReviewAction(action);
        setReviewPopup(true);
    };

    const handleConfirmReview = async () => {
        if (!selectedRecord) return;

        const success = await handleReview(
            selectedRecord.id,
            reviewAction,
            reviewNote.trim() || undefined
        );

        if (success) {
            setReviewPopup(false);
            setSelectedRecord(null);
            setReviewNote("");
            await refreshCurrentPage(pagination?.page || 1);
        }
    };

    const beneficiaryColumns: (TableColumn | null)[] = [
        { key: "project",  label: "Project",  visibleOn: "lg", render: (row) => row.project?.name || "-" },
        { key: "family_code", label: "Family Code", visibleOn: "always" },
        { key: "head_name", label: "Head of Family", visibleOn: "always" },
        { key: "members_count", label: "Members", visibleOn: "sm", render: (row) => `${row.members?.length || 0} members`},
        { key: "review_status", label: "Status", visibleOn: "always",
            render: (row) => {
                const statusColors: any = {
                    pending: "yellow",
                    approved: "green",
                    rejected: "red"
                };
                return (
                    <StatusBadge
                        text={row.review_status}
                        color={statusColors[row.review_status] || "gray"}
                    />
                );
            }
        },
        { key: "created_by", label: "Created By", visibleOn: "sm", render: (row) => `${row.createdBy?.user?.name  || "--"}`},
        !isCollaborator ?
        { key: "reviewed_by_membership_id", label: "Reviewed By", visibleOn: "lg", render: (row) =>   `${row.reviewedBy?.user?.name  || "--"}` }:
        null,

        {
            key: "updated_at",
            label: "Last Update",
            visibleOn: "lg",
            render: (row) => formatDate(row.updated_at, false)
        },
        {
            key: "action",
            label: "Action",
            visibleOn: "always",
            render: (row) => {
                return (
                    <div className="flex items-center space-x-3">
                        <ActionIcon
                            name="view"
                            onClick={() => openModal('view', row.id)}
                        />
                        
                        {/* Collaborator can review pending items */}
                        {isCollaborator && row.review_status === 'pending' && (
                            <>
                                <ActionIcon
                                    name="check"
                                    onClick={() => openReviewPopup(row, 'approve')}
                                    className="text-green-600 hover:text-green-700"
                                />
                                <ActionIcon
                                    name="close_red"
                                    onClick={() => openReviewPopup(row, 'reject')}
                                    className="text-red-600 hover:text-red-700"
                                />
                            </>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <div className="grid grid-cols-1 gap-4 mt-2">
            <div className="flex flex-col items-start justify-start rounded-sm bg-white gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <div className="w-full sm:w-64 lg:w-80">
                            <SearchInput
                                placeholder="Search for family code or head name"
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
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg w-full">
                        <div className="w-50">
                            <SelectInput
                                options={[
                                    { label: "All Status", value: "" },
                                    { label: "Pending", value: "pending" },
                                    { label: "Approved", value: "approved" },
                                    { label: "Rejected", value: "rejected" }
                                ]}
                                value={filters.reviewStatus}
                                onChange={(e) => handleReviewStatusChange(e.target.value)}
                            />
                        </div>

                        <div className="w-50">
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
                        <Loading text="Please wait..." />
                    </div>
                ) : (
                    <>
                        {data.length === 0 ? (
                            <div className="w-full bg-gray-50 rounded-md">
                                <EmptyState
                                    title="No Record Found"
                                    description="Collaborators and Enumerators are the ones responsible for filling in these records on their dashboard"
                                />
                            </div>
                        ) : (
                            <>
                                <Table
                                    columns={beneficiaryColumns}
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
                    </>
                )}
            </div>

            {/* View Modal */}
            <Modal
                isOpen={modalMode === 'view'}
                onClose={closeModal}
                title="Beneficiary Details"
            >
                <BeneficiaryView
                    isOpen={modalMode === 'view'}
                    id={selectedRecord?.id || 0}
                />
            </Modal>

            {/* Review Popup */}
           <Popup
            open={reviewPopup}
            onClose={() => {
                setReviewPopup(false);
                setReviewNote("");
                setSelectedRecord(null);
            }}
            title={`${reviewAction === 'approve' ? 'Approve' : 'Reject'} Beneficiary`}
            description={
                selectedRecord ? (
                    <div className="space-y-3">
                        <p>
                            You are about to <strong>{reviewAction}</strong> the beneficiary{' '}
                            <span className="font-bold">{selectedRecord.family_code}</span> -{' '}
                            <span className="font-bold">{selectedRecord.head_name}</span>.
                        </p>
                        {reviewAction === 'reject' && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for rejection <span className="text-red-500">*</span>
                                </label>
                                <Textarea
                                    value={reviewNote}
                                    onChange={(e) => setReviewNote(e.target.value)}
                                    placeholder="Please provide a reason for rejection..."
                                    rows={3}
                                    className={reviewNote.trim() === "" ? "border-red-300" : ""}
                                />
                                {reviewNote.trim() === "" && (
                                    <p className="mt-1 text-sm text-red-600">
                                        Rejection reason is required
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    "Loading..."
                )
            }
            confirmText={reviewAction === 'approve' ? 'Approve' : 'Reject'}
            cancelText="Cancel"
            onConfirm={async () => {
                // Validate rejection note
                if (reviewAction === 'reject' && reviewNote.trim() === "") {
                    return; // Don't proceed if rejection note is empty
                }
                await handleConfirmReview();
            }}
            confirmButtonClass={
                reviewAction === 'approve'
                    ? "bg-green-500 hover:bg-green-400"
                    : "bg-red-500 hover:bg-red-400"
            }
        />
        </div>
    );
};

export default Families;
