import { useState } from "react";
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

const Assistance = () => {

    const [currentPage, setCurrentPage] = useState(1);
    const [typeModal, setTypeModal] = useState(false);
    const [assistanceModal, setAsssitanceModal] = useState(false);

    const assistanceColumns: TableColumn[] = [
    { key: "id", label: "User ID", visibleOn: "md" },
    { key: "name", label: "Name", visibleOn: "always" },
    { key: "type", label: "Type", visibleOn: "md" },
    { key: "unit", label: "Unit", visibleOn: "sm" },
    { key: "date_of", label: "Created At", visibleOn: "lg" },
    { key: "status", label: "Status", visibleOn: "always", render: (row) => {
        if(row.status === "false"){
            return (
              <StatusBadge text="Deleted" color="red" />
            );
          }else if(row.status === "true"){
            return <StatusBadge text="Active" color="purple" />
          }
    } },
    { key: "status", label: "Status", visibleOn: "always", render: (row) => {
          return(
             <div className="flex items-center space-x-3">
                <ActionIcon name="edit" />
                <ActionIcon name="view" />
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

                        <ActionButton  />
                        <Button className="w-full" onClick={() => setAsssitanceModal(true) }>
                            New Assistance
                        </Button>
                        <Button className="w-full" variant="ghost" onClick={() => setTypeModal(true)}>
                            New Type
                        </Button>
                    </div>
                </div>

                 <Table columns={assistanceColumns} data={assistanceTypesData} className="" page={currentPage} pageSize={4} />
            </div>

            <Modal
                isOpen={typeModal}
                onClose={() => setTypeModal(false)}
                title="New Type"
                children={<Type />}
            />

            <Modal
                isOpen={assistanceModal}
                onClose={() => setAsssitanceModal(false)}
                title="New Assistance"
                children={<AssistanceForm onClose={() => setAsssitanceModal(false)} />}
            />
        </div>
     );
}
 
export default Assistance;