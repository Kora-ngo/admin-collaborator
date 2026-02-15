import { useEffect, useState } from "react";
import { useMembership } from "../../features/users/hooks/useMember";
import { useMembershipStore } from "../../features/users/store/membershipStore";
import type { TableColumn } from "../../components/widgets/table";
import { formatCode } from "../../utils/formatCode";
import { formatDate } from "../../utils/formatDate";
import StatusBadge from "../../components/widgets/status-badge";
import ActionIcon from "../../components/widgets/action-icon";
import SearchInput from "../../components/widgets/search-input";
import { FilterToggleButton } from "../../components/widgets/filter-button";
import { ActionButton } from "../../components/widgets/action-button";
import { Button } from "../../components/widgets/button";
import { SelectInput } from "../../components/widgets/select-input";
import Loading from "../../components/widgets/loading";
import EmptyState from "../../components/widgets/empty";
import Table from "../../components/widgets/table";
import Modal from "../../components/widgets/modal";
import MembershipForm from "../../features/users/components/membership-form";
import MembershipView from "../../features/users/components/membership-view";
import Popup from "../../components/widgets/popup";
import { useAuthStore } from "../../features/auth/store/authStore";

type ModalMode = 'add' | 'edit' | 'view' | null;

const User = () => {
    const {data, getData, pagination, loading} = useMembershipStore();
    const userData = useAuthStore((state) => state.user);
    const [loadingViewId, setLoadingViewId] = useState<number | null>(null);
    const {role} = useAuthStore();

    const {
        filters,
        filterMode,
        toggleFilter,
        handleStatusChange,
        handleRoleChange,
        searchTerm, 
        handleSearch, 
        refreshCurrentPage, 
        handleToggle,
        handleDatePresetChange,
        handleView

    } = useMembership();

    const [deletePopup, setDeletePopUp] = useState(false);
    const [disableUserPopup, setDisableUserPopup] = useState(false);
    const [membershipModalMode, setMembershipModalMode] = useState<ModalMode>(null);
    const [selectedRecord, setSelectedRecord] = useState<{
        id: number;
        userName: string;
        status: "true" | "false" | "blocked";
        } | null>(null);


    const openMembershipModal = async (mode: 'add' | 'edit' | 'view', id?: number) => {
        if (mode === 'add') {
            setMembershipModalMode('add');
            setSelectedRecord(null);
            return;
        }

        if (!id) return;

        const fullRecord = await handleView(id);

        setSelectedRecord({
            id,
            userName: fullRecord.user.name,
            status: fullRecord.status,
        });

        setMembershipModalMode(mode);
    };


    const closeMembershipModal = () => {
        setMembershipModalMode(null);
        setSelectedRecord(null);
    };

    useEffect(() => {
        getData();
    }, [getData]);


    const membershipColumns: (TableColumn | null)[] = [
    { key: "id", label: "ID", visibleOn: "lg",  render: (_, globalIndex) => formatCode("MB", globalIndex) },
    { key: "user", label: "Member", visibleOn: "always", render: (row) => row.user.name },

    
    { key: "email", label: "Email", visibleOn: "md", render: (row) => row.user.email },

    { key: "role", label: "Role", visibleOn: "sm", render: (row) => {
        const roleText = row.role === "admin" ? "Admin" : row.role === "collaborator" ? "Collaborator" : "Enumerator";
        const color = row.status === "false" ? "red" : row.role === "admin" ? "orange" : row.role === "collaborator" ? "blue" : "yellow";
        return <StatusBadge text={userData?.id === row.user_id ? `${roleText} - You` : roleText} color={color} />;
    }},

    role === "admin" ?
    { key: "date_of", label: "Created At", visibleOn: "lg", render: (row) => formatDate(row.date_of, false) }: null,


    { key: "status", label: "Status", visibleOn: "always", render: (row) => {
        if(row.status === "false"){
            return <StatusBadge text="Deleted" color="red" />;
        }else if(row.status === "blocked") {
            return <StatusBadge text="Blocked" color="orange" />;
        }else {
            return <StatusBadge text="Active" color="purple" />;
        }
    } },
    { key: "action", label: "Action", visibleOn: "always", render: (row) => {

        if(row.status === 'false')
        {
            return(
             <div className="flex items-center space-x-3">
                <ActionIcon name="restore"
                    onClick={() => {
                        setSelectedRecord({
                            id: row.id,
                            userName: row.user.name,
                            status: row.status
                        });
                        setDeletePopUp(true);
                    }}
                />
             </div>
          )
        }

          return(
             <div className="flex items-center space-x-3">
                {/* <ActionIcon name="edit"
                    onClick={() =>
                        {setSelectedRecord({
                            id: row.id,
                            userName: row.user.name,
                            status: row.status
                        })
                        openMembershipModal('edit', row.id)}}
                /> */}


                <ActionIcon name={loadingViewId === row.id ? "spinner" : "view"}
                    onClick={async () => {
                        if (loadingViewId === row.id) return; // Prevent double-click
                        
                        setLoadingViewId(row.id);
                        setSelectedRecord({
                            id: row.id,
                            userName: row.user.name,
                            status: row.status
                        });
                        
                        try {
                            await openMembershipModal('view', row.id);
                        } finally {
                            setLoadingViewId(null);
                        }
                    }}
                />

                {
                    role === "admin" ?
                    (
                        <ActionIcon name={row.status === "blocked" ? "unlock" : "lock"}
                            onClick={() => {
                                setSelectedRecord({
                                    id: row.id,
                                    userName: row.user.name,
                                    status: row.status
                                });
                                setDisableUserPopup(true);
                            }}
                        />
                    )  :
                    // (<ActionIcon name="assign" onClick={() => {}} />)
                    (<></>)

                }


                {
                    role === "admin" && row.status != "blocked" ?
                    (
                        <ActionIcon name="trash"
                            onClick={() => {
                                setSelectedRecord({
                                    id: row.id,
                                    userName: row.user.name,
                                    status: row.status
                                });
                                setDeletePopUp(true);
                            }}
                        />
                    )  :
                    role === "admin" && row.status === "blocked" ?
                    (
                        <ActionIcon name="disable" />
                    )  :
                    // (<ActionIcon name="delivery" onClick={() => {}} />)
                    (<></>)
                }
             </div>
          )
    } },
    ];

    

    return ( 
        <div className="grid grid-cols-1 gap-4 mt-2">
            <div className="flex flex-col items-start justify-start rounded-sm bg-white gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <div className="flex flex-row gap-4 w-full sm:w-auto">
                        <div className="w-[70%] sm:w-64 lg:w-80">
                            <SearchInput
                                placeholder="Search for a member's name"
                                className="w-full sm:w-64 lg:w-80"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-[30%] sm:w-auto flex-shrink-0">
                            <FilterToggleButton isOpen={filterMode} onToggle={toggleFilter} />
                        </div>
                    </div>
                    <div className="flex flex-row gap-3 w-full sm:w-auto">
                        <ActionButton className="h-10 w-[14%] sm:w-auto" onClick={() => refreshCurrentPage(pagination?.page!)} />
                        {
                            role === "admin" && (
                                <Button className="w-full sm:w-auto" onClick={() => openMembershipModal('add')}>
                                    New User
                                </Button>
                            )
                        }
                        
                    </div>
                </div>

                {filterMode && (
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg w-full">
                    <div className="w-50">
                        <SelectInput
                            options={[
                                { label: "All Status", value: "" },
                                { label: "Active", value: "true" },
                                { label: "Deleted", value: "false" },
                                { label: "Blocked", value: "blocked" },
                            ]}
                            value={filters.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            />
                    </div>

                    {
                        role === "admin" &&
                        (
                            <>
                                <div className="w-50">
                                    <SelectInput
                                        options={[
                                            { label: "All Roles", value: "" },
                                            { label: "Admin", value: "admin" },
                                            { label: "Collaborator", value: "collaborator" },
                                            { label: "Enumerator", value: "enumerator" },
                                        ]}
                                        value={filters.role}
                                        onChange={(e) => handleRoleChange(e.target.value)}
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
                            </>
                        )
                    }
                </div>
                )}

                {loading ? (
                    <div className="flex justify-center w-full mt-20">
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
                            <Table columns={membershipColumns} data={data} className="" />
                            {/* Pagination same as original */}
                            <div className="flex flex-col sm:flex-row justify-between w-full gap-4 mt-1">
                                {/* ... exact same pagination code from Assistance */}
                            </div>

                            {/* === PAGINATION FROM YOUR ANCIENT RECORD === */}
                            <div className="flex flex-col sm:flex-row justify-between w-full gap-4 mt-1">
                                <div>
                                    <p className="text-gray-500">
                                    Total Records: <span className="font-bold text-black">{pagination?.total || 0}</span>
                                    </p>
                                </div>

                                <div>
                                    <nav aria-label="Page navigation">
                                    <ul className="inline-flex -space-x-px text-sm">
                                        {/* Previous */}
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

                                        if (current > 3) {
                                            pages.push("...");
                                        }

                                        for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
                                            if (!pages.includes(i)) {
                                            pages.push(i);
                                            }
                                        }

                                        if (current < total - 2) {
                                            pages.push("...");
                                        }

                                        if (total > 1) {
                                            pages.push(total);
                                        }

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

                                        {/* Next */}
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
                isOpen={membershipModalMode !== null}
                onClose={closeMembershipModal}
                title={
                    membershipModalMode === 'add' ? "New Member" :
                    membershipModalMode === 'view' ? "View Member" :
                    "Edit Member"
                }
                children={
                    membershipModalMode === 'add' || membershipModalMode === 'edit' ? (
                        <MembershipForm
                            id={selectedRecord?.id}
                            isOpen={membershipModalMode !== null}
                            onSuccess={() => {
                                getData();
                                closeMembershipModal();
                            }}
                        />
                    ) : (
                        <MembershipView
                            isOpen={membershipModalMode === 'view'}
                            id={selectedRecord?.id || 0}
                        />
                    )
                }
            />

            <Popup
                loading={loading}
                open={deletePopup}
                onClose={() => setDeletePopUp(false)}
                title={selectedRecord?.status === "true" ? "Deactivate Record" : "Activate Record"}
                description={
                    selectedRecord ? (
                    <>
                        You are about to <strong>{selectedRecord.status === "true" ? "delete" : "restore"} </strong> 
                        the assignment for <span className="font-bold">{selectedRecord.userName}</span>. 
                        Do you want to proceed?
                    </>
                    ) : "Loading..."
                }
                confirmText={selectedRecord?.status === "true" ? "Delete" : "Restore"}
                cancelText="Cancel"
                onConfirm={async () => {
                    if (!selectedRecord) return;

                    const success = await handleToggle(selectedRecord.id, selectedRecord?.status === "true" ? "false" : "true");
                    if (success) {
                        setDeletePopUp(false);
                        setSelectedRecord(null);
                        await refreshCurrentPage(pagination!.page);
                    }
                }}
                confirmButtonClass={
                    selectedRecord?.status === "true" 
                    ? "bg-red-500 hover:bg-red-400" 
                    : "bg-accent hover:bg-accent/80"
                }
            />



                <Popup
                    loading={loading}
                    open={disableUserPopup}
                    onClose={() => setDisableUserPopup(false)}
                    title={selectedRecord?.status === "true" ? "Disable Member" : "Enable Member"}
                    description={
                        selectedRecord ? (
                        <>
                            You are about to <strong>{selectedRecord.status === "true" ? "disable" : "enable"} </strong> 
                            the user <span className="font-bold">{selectedRecord.userName}</span>. 
                            Do you want to proceed?
                        </>
                        ) : "Loading..."
                    }
                    // loading={true}
                    confirmText={selectedRecord?.status === "true" ? "Disable" : "Enable"}
                    cancelText="Cancel"
                    onConfirm={async () => {
                        if (!selectedRecord) return;

                        // Toggle between "true" (active) and "blocked"
                        const newStatus = selectedRecord.status === "true" ? "blocked" : "true";

                        const success = await handleToggle(selectedRecord.id, newStatus);
                        if (success) {
                        setDisableUserPopup(false);
                        setSelectedRecord(null);
                        await refreshCurrentPage(pagination!.page);
                        }
                    }}
                    confirmButtonClass={
                        selectedRecord?.status === "true" 
                        ? "bg-red-500"   // Disable = red
                        : "bg-accent" // Enable = green
                    }
                />

        </div>
     );
}
 
export default User;