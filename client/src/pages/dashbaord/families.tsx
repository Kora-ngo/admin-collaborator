// src/features/family/families.tsx

import { ActionButton } from "../../components/widgets/action-button";
import EmptyState from "../../components/widgets/empty";
import { FilterToggleButton } from "../../components/widgets/filter-button";
import SearchInput from "../../components/widgets/search-input";

const Families = () => {
  return (
    <div className="grid grid-cols-1 gap-4 mt-2">
        <div className="flex flex-col items-start justify-start rounded-sm bg-white gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <div className="w-full sm:w-64 lg:w-80">
                        <SearchInput
                            placeholder="Search for a member's name"
                            className="w-full sm:w-64 lg:w-80"/>
                    </div>
                    <FilterToggleButton isOpen={false} onToggle={() => {}} />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <ActionButton className="h-10" />
                </div>
            </div>
            <div className="w-full bg-gray-50 rounded-md">
                <EmptyState title="No Record Found"
                description="Collaborators and Enumerators are the one responsible for filling in this records on their dashbaord"
                />
            </div>
        </div>
    </div>
  );
};

export default Families;