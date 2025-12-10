import { useState } from "react";
import { ActionButton } from "../../components/widgets/action-button";
import { Button } from "../../components/widgets/button";
import { FilterToggleButton } from "../../components/widgets/filter-button";
import SearchInput from "../../components/widgets/search-input";
import Table, { type TableColumn } from "../../components/widgets/table";
import { usersData } from "../../dummy-data/userData";
import ActionIcon from "../../components/widgets/action-icon";
import Modal from "../../components/widgets/modal";
import Popup from "../../components/widgets/popup";

const User = () => {

    const [currentPage, setCurrentPage] = useState(1);

    const [userModal, setUserModal] = useState(false);
    const [deleteUserPopup, setDeleteUserPopup] = useState(false);


    const userColumns: TableColumn[] = [
    { key: "id", label: "User ID", visibleOn: "md" },
    { key: "name", label: "Name", visibleOn: "always" },
    { key: "email", label: "Email", visibleOn: "md" },
    { key: "role", label: "Role", visibleOn: "sm" },
    { key: "createdAt", label: "Created At", visibleOn: "lg" },
    { key: "status", label: "Status", visibleOn: "always" },
    { key: "status", label: "Status", visibleOn: "always", render: (row) => {
          return(
             <div className="flex items-center space-x-3">
                <ActionIcon name="edit" />
                <ActionIcon name="view" />
                <ActionIcon name="trash" onClick={() => setDeleteUserPopup(true)} />
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
                            placeholder="Search for user or role"
                            className="w-full sm:w-64 lg:w-80"
                            />
                        </div>
                        <FilterToggleButton isOpen={false} onToggle={() => {}} />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

                        <ActionButton  />
                        <Button className="w-full sm:w-32" onClick={() => setUserModal(true)}>
                            New User
                        </Button>
                    </div>
                </div>

                 <Table columns={userColumns} data={usersData} className="" page={currentPage} pageSize={4} />
            </div>


            <Modal
                isOpen={userModal}
                onClose={() => setUserModal(false)}
                title="New User"
                children={<p>This is the modal</p>}
            />

            <Popup 
                open={deleteUserPopup}
                onClose={() => {setDeleteUserPopup(false)}}
                title="Delete User"
                description="This action is irreversible"
                onConfirm={() => {}}
            />


        </div>
     );
}
 
export default User;