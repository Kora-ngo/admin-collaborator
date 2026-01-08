// src/features/family/families.tsx

import { useState } from "react";
import { ActionButton } from "../../components/widgets/action-button";
import EmptyState from "../../components/widgets/empty";
import { FilterToggleButton } from "../../components/widgets/filter-button";
import SearchInput from "../../components/widgets/search-input";
import { Button } from "../../components/widgets/button";
import Modal from "../../components/widgets/modal";

const Families = () => {

      const [isModalOpen, setIsModalOpen] = useState(false);

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
                    <Button onClick={() => setIsModalOpen(true)}>
                        Open Modal
                    </Button>
                </div>
            </div>
            <div className="w-full bg-gray-50 rounded-md">
                <EmptyState title="No Record Found"
                description="Collaborators and Enumerators are the one responsible for filling in this records on their dashbaord"
                />
            </div>
        </div>


         <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Project Settings"
        

        
        // Main modal content
        children={
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter project name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={4}
                placeholder="Project description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
          </div>
        }
        
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Save Changes
            </Button>
          </>
        }
      />
    </div>
  );
};

export default Families;