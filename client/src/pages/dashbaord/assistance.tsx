import { useEffect, useState } from "react";
import { ActionButton } from "../../components/widgets/action-button";
import ActionIcon from "../../components/widgets/action-icon";
import { Button } from "../../components/widgets/button";
import { FilterToggleButton } from "../../components/widgets/filter-button";
import SearchInput from "../../components/widgets/search-input";
import StatusBadge from "../../components/widgets/status-badge";
import type { TableColumn } from "../../components/widgets/table";
import Table from "../../components/widgets/table";
import { assistanceTypesData } from "../../dummy-data/assiatnceData";
import Modal from "../../components/widgets/modal";
import TypeView from "../../features/assistance/components/type-view";
import Type from "../../features/assistance/components/type";
import AssistanceForm from "../../features/assistance/components/assistance-form";
import { useAssistanceStore } from "../../features/assistance/store/assistanceStore";
import { formatDate } from "../../utils/formatDate";
import { formatCode } from "../../utils/formatCode";
import EmptyState from "../../components/widgets/empty";
import Loading from "../../components/widgets/loading";
import AssistanceView from "../../features/assistance/components/assistance-view";

const Assistance = () => {

    const {data, loading, fetchData} = useAssistanceStore();

    const [currentPage, setCurrentPage] = useState(1);
    const [typeModal, setTypeModal] = useState(false);
    const [assistanceModal, setAsssitanceModal] = useState(false);


    const [dataID, setDataID] = useState(0);
    const [modalSate, setModalState] = useState<'add' | 'view' | 'edit'>('add'); 
    

    useEffect(() => {
        fetchData()
    }, [fetchData])

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
                    onClick={() => {
                        setDataID(row.id);
                        setModalState('edit');
                        setAsssitanceModal(true);
                }}
                />
                <ActionIcon name="view"
                    onClick={() => {
                        setDataID(row.id);
                        setModalState('view');
                        setAsssitanceModal(true);
                }}
                />
                <ActionIcon name="trash" />
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
                            placeholder="Search for name or type"
                            className="w-full sm:w-64 lg:w-80"
                            />
                        </div>
                        <FilterToggleButton isOpen={false} onToggle={() => {}} />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

                        <ActionButton onClick={fetchData} />
                        <Button className="w-full" variant="ghost" onClick={() => setTypeModal(true)}>
                            New Type
                        </Button>
                        <Button className="w-full" onClick={() => {setModalState('add'); setAsssitanceModal(true)} }>
                            New Assistance
                        </Button>
                    </div>
                </div>

                
                {loading ?
                    (
                        <div className="w-[75vw] mt-20">
                            <Loading text="Please wait..." />
                        </div>
                    ) :
                    
                    <>
                        {
                            data.length === 0 ?
                            <div className="w-full bg-gray-50 rounded-md">
                                <EmptyState 
                                    title="No Record Found"
                                    /> 
                            </div>
                            :
                            <Table columns={assistanceColumns} data={data} className="" page={currentPage} pageSize={4} />

                        }
                    </>
                }
                
               

            </div>

            <Modal
                isOpen={typeModal}
                onClose={() => setTypeModal(false)}
                title="New Type"
                children={<Type />}
            />

            <Modal
                isOpen={assistanceModal}
                onClose={() => {setDataID(0); setAsssitanceModal(false)}}
                title={modalSate === 'add' ? "New Assistance" : modalSate === 'view' ? "View Assistance" : "Edit"}
                children={
                    modalSate === 'add' || modalSate === 'edit' ?
                    <AssistanceForm id={dataID} onClose={() => setAsssitanceModal(false)} />:
                    <AssistanceView isOpen={assistanceModal} id={dataID} />
                    
                }
            />
        </div>
     );
}
 
export default Assistance;