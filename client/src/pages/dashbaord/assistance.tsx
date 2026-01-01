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
import Type from "../../features/assistance/components/type";
import AssistanceForm from "../../features/assistance/components/assistance-form";
import { useAssistanceStore } from "../../features/assistance/store/assistanceStore";
import { formatDate } from "../../utils/formatDate";
import { formatCode } from "../../utils/formatCode";
import EmptyState from "../../components/widgets/empty";
import Loading from "../../components/widgets/loading";
import AssistanceView from "../../features/assistance/components/assistance-view";
import Popup from "../../components/widgets/popup";
import { useAssis } from "../../features/assistance/hooks/useAssis";
import { SelectInput } from "../../components/widgets/select-input";

type ModalMode = 'add' | 'edit' | 'view' | null;

const Assistance = () => {

    const {data, getData, pagination, loading} = useAssistanceStore();
    const {
            filters,
            filterMode,
            typeData,
            toggleFilter,
            handleStatusChange,
            handleTypeChange,
            searchTerm, 
            handleSearch, 
            refreshCurrentPage, 
            handleDelete
        } = useAssis();

    const [typeModal, setTypeModal] = useState(false);
    const [deletePopup, setDeletePopUp] = useState(false);


    const [assistanceModalMode, setAssistanceModalMode] = useState<ModalMode>(null);
    const [currentAssistanceId, setCurrentAssistanceId] = useState<number | null>(null);


    const openAssistanceModal = (mode: 'add' | 'edit' | 'view', id?: number) => {
        setAssistanceModalMode(mode);
        setCurrentAssistanceId(id ?? null);
    };

    const closeAssistanceModal = () => {
        setAssistanceModalMode(null);
        setCurrentAssistanceId(null);
    };
    


    useEffect(() => {
        getData();
    }, [getData]);


    




    

    const assistanceColumns: TableColumn[] = [
    { key: "id", label: "ID", visibleOn: "always",  render: (_, globalIndex) => formatCode("AS", globalIndex) },
    { key: "name", label: "Name", visibleOn: "always" },
    { key: "type", label: "Type", visibleOn: "md", render: (row) => row.assistanceType.name },
    { key: "unit", label: "Unit", visibleOn: "sm", render: (row) => row.assistanceType.unit },
    { key: "date_of", label: "Created At", visibleOn: "lg", render: (row) => formatDate(row.date_of, false) },
    { key: "status", label: "Status", visibleOn: "always", render: (row) => {
        if(row.status === "false"){
            return (
              <StatusBadge text="Deleted" color="red" />
            );
          }else if(row.status === "true"){
            return <StatusBadge text="Active" color="purple" />
          }
    } },
    { key: "action", label: "Action", visibleOn: "always", render: (row) => {
          return(
             <div className="flex items-center space-x-3">
                <ActionIcon name="edit"
                    onClick={() => openAssistanceModal('edit', row.id)}
                />
                <ActionIcon name="view"
                    onClick={() => openAssistanceModal('view', row.id)}
                />
                <ActionIcon name="trash"
                    onClick={() => {
                        setCurrentAssistanceId(row.id);
                        setDeletePopUp(true);
                    }}
                />
             </div>
          )
    } },
    ];


    return ( 
        <div className="grid grid-cols-1 gap-4 mt-2">
            <div className="flex flex-col items-start justify-start rounded-sm bg-white  gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <div className="w-full sm:w-64 lg:w-80">
                            <SearchInput
                                placeholder="Search for name"
                                className="w-full sm:w-64 lg:w-80"
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <FilterToggleButton isOpen={filterMode} onToggle={toggleFilter} />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

                        <ActionButton onClick={() => refreshCurrentPage(pagination?.page!)} />
                        <Button className="w-full" variant="ghost" onClick={() => setTypeModal(true)}>
                            New Type
                        </Button>
                        <Button className="w-full" onClick={() => openAssistanceModal('add')}>
                            New Assistance
                        </Button>
                    </div>
                </div>

                {filterMode && (
                <div className="flex  gap-4 p-4 bg-gray-50 rounded-lg w-full">
                    <div className="w-50">
                        <SelectInput
                            options={[
                                { label: "All Status", value: "" },
                                { label: "Active", value: "true" },
                                { label: "Deleted", value: "false" },
                            ]}
                            value={filters.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            />
                    </div>

                    <div className="w-50">
                        <SelectInput
                            options={[
                                { label: "All Types", value: 0 },
                                ...typeData.map((type) => ({
                                    label: `${type.name} (${type.unit})`, value: type.id
                                }))
                            ]}
                            value={filters.typeId}
                            onChange={(e) => handleTypeChange(Number(e.target.value))}
                        />
                    </div>

                    {/* <Input type="date" value={filters.dateFrom} onChange={(e) => handleDateFrom(e.target.value)} />
                    <Input type="date" value={filters.dateTo} onChange={(e) => handleDateTo(e.target.value)} /> */}
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
                            columns={assistanceColumns}
                            data={data}
                            className=""
                            />

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
                    </>
                )}
                
               

            </div>

            <Modal
                isOpen={typeModal}
                onClose={() => setTypeModal(false)}
                title="New Type"
                children={<Type />}
            />

            <Modal
                isOpen={assistanceModalMode !== null}
                onClose={closeAssistanceModal}
                title={
                    assistanceModalMode === 'add' ? "New Assistance" :
                    assistanceModalMode === 'view' ? "View Assistance" :
                    "Edit Assistance"
                }
                children={
                    assistanceModalMode === 'add' || assistanceModalMode === 'edit' ? (
                        <AssistanceForm
                            id={currentAssistanceId ?? undefined}
                            isOpen={assistanceModalMode !== null}
                            onSuccess={() => {
                                getData();
                                closeAssistanceModal();
                            }}
                        />
                        ) : (
                        <AssistanceView
                            isOpen={assistanceModalMode === 'view'}
                            id={currentAssistanceId!}
                        />
                        )
                }
            />

            <Popup
                open={deletePopup}
                onClose={() => setDeletePopUp(false)}
                title="Delete this record"
                description={<>This record is about to be deleted. Do you want to proceed </>}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={async () => {
                    if (!currentAssistanceId) return;

                        const success = await handleDelete(currentAssistanceId);
                        if (success) {
                        setDeletePopUp(false);
                        // No need to clear ID separately — modal already closed or will stay consistent
                        await getData();
                        }
                }}
            confirmButtonClass="bg-red-500 hover:bg-red-400"
            />


        </div>
     );
}
 
export default Assistance;