
import Table from "../components/widgets/table";
import StatusBadge from "../components/widgets/status-badge";
import SearchInput from "../components/widgets/search-input";
import ActionIcon from "../components/widgets/action-icon";
import { Button } from "../components/widgets/button";
import { ActionButton } from "../components/widgets/action-button";
import { FilterToggleButton } from "../components/widgets/filter-button";
import { useState } from "react";



const Login = () => {

    const [filterOpen, setFilterOpen] = useState(false);

    const columns: any = [
  {
    key: "name",
    label: "Name",
    visibleOn: "always",
  },
  {
    key: "email",
    label: "Email",
    visibleOn: "md",
  },
  {
    key: "status",
    label: "Status",
    visibleOn: "always",
    render: (row: any) => (
      <span className="font-semibold">
        {row.status === "false" ? <StatusBadge text="Inactive" color="red" /> : <StatusBadge text="Active" color="blue" />}
      </span>
    ),
  },

  {
    key: "",
    label: "Action",
    visibleOn: "always",
    render: () => (
      <div className="flex gap-2">
        <ActionIcon name="view" />
        <ActionIcon name="edit" />
        <ActionIcon name="trash" />
      </div>
    ),
  },

];

const data = [
  { name: "John Doe", email: "john@example.com", status: "true" },
  { name: "Jane Smith", email: "jane@example.com", status: "true" },
  { name: "Jane Smith", email: "jane@example.com", status: "true" },
];


    return ( 
        <div className="p-5 flex gap-4">
            <div className="w-150">
                <div className="flex w-80 gap-5">
                    <SearchInput placeholder="Search for somthing" />
                    <Button children="Hello" />
                    <ActionButton />
                    <FilterToggleButton
                        isOpen={filterOpen}
                        onToggle={() => setFilterOpen(!filterOpen)}
                    />
                </div>

                <Table
                columns={columns}
                data={data}
                className="mt-4"
                />

            </div>
        </div>
     );
}
 
export default Login;