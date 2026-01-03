import { useState } from "react";
import { ActionButton } from "../../components/widgets/action-button";
import { Button } from "../../components/widgets/button";
import { FilterToggleButton } from "../../components/widgets/filter-button";
import SearchInput from "../../components/widgets/search-input";
import Modal from "../../components/widgets/modal";
import ProjectForm from "../../features/project/components/project-form";

type ModalMode = 'add' | 'edit' | 'view' | null;

const Projects = () => {

        const [projectModalMode, setProjecModalMode] = useState<ModalMode>(null);
        
        const [selectedRecord, setSelectedRecord] = useState<{
            id: number;
            userName: string;
            status: "true" | "false";
        } | null>(null);

        const closeProjectModal = () => {
            setProjecModalMode(null);
            setSelectedRecord(null);
        };

        const openProjectModal = async (mode: 'add' | 'edit' | 'view', id?: number) => {
            if (mode === 'add') {
                setProjecModalMode('add');
                setSelectedRecord(null);
                return;
            }

            if (!id) return;

            // const fullRecord = await handleView(id);

            // setSelectedRecord({
            //     id,
            //     userName: fullRecord.user.name,
            //     status: fullRecord.status,
            // });

            setProjecModalMode(mode);
    };

    return ( 
        <div className="grid grid-cols-1 gap-4 mt-2">
            <div className="flex flex-col items-start justify-start rounded-sm bg-white gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <div className="w-full sm:w-64 lg:w-80">
                            <SearchInput
                                placeholder="Search for project name"
                                className="w-full sm:w-64 lg:w-80"
                                // value={searchTerm}
                                // onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <FilterToggleButton isOpen={false} onToggle={() => {}} />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <ActionButton />
                        <Button className="w-full" onClick={() => openProjectModal('add') } >
                            New Project
                        </Button>
                    </div>
                </div>
            </div>


            <Modal
                isOpen={projectModalMode !== null}
                onClose={closeProjectModal}
                title={
                    projectModalMode === 'add' ? "New Project" :
                    projectModalMode === 'view' ? "View Project" :
                    "Edit Project"
                }
                children={<ProjectForm
                    id={selectedRecord != null ? selectedRecord!.id : undefined} 
                    onSuccess={() =>{}}
                    isOpen={projectModalMode !== null}  />}
            />
        </div>
     );
}
 
export default Projects;