import { useEffect } from "react";
import EmptyState from "../../../components/widgets/empty";
import type { Beneficiary } from "../../../types/beneficiary";
import { useAuthStore } from "../../auth/store/authStore";
import Accordion from "../../../components/widgets/accordion";
import { calculateAge } from "../../../utils/calculateAge";

interface ProjectViewFamilyProps {
    selectedFamily: Beneficiary[] |undefined
}


const ProjectViewFamilies = ({selectedFamily}: ProjectViewFamilyProps) => {
    const {membership} = useAuthStore();

    useEffect(() => {
    }, [selectedFamily])

    if(!selectedFamily || selectedFamily.length === 0)
    {
    return ( 
        <div className="flex justify-center items-center h-80">
            <EmptyState
                title="No Record Found"
                description={
                    membership?.role === "admin" ?
                    "Collaborators and/or Enumerators are the one responsible for filling in this records on their dashbaord" :
                    "Only approved records will be viewed within this project"
                }
            />
        </div>
     );
    }

    

    return (
        <>
        {
        selectedFamily.map((beneficiary: any) => (
            <Accordion
            items={[
                    {
                        title: beneficiary.family_code,
                        subtitle: `Family Head: ${beneficiary.head_name}`,
                        count: beneficiary.members.length,
                        subTiles: beneficiary.members?.map((member: any) => ({
                        title: member.full_name,
                        // subtitle: member.relationship,
                        iconLeading: (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-primary">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg> 
                        ),
                        content: (
                            <div className="flex text-sm text-gray-600">
                                <p>{member.gender}</p>
                                <span className="px-2">-</span>
                                <p>{calculateAge(member.date_of_birth, "", " years old") || 'N/A'}</p>
                                <span className="px-2">-</span>
                                <p>{member.relationship || 'N/A'}</p>
                            </div>
                        ),
                        })) || [],
                        },
            ]}
            />
        ))
        }
        </>
    )

}
export default ProjectViewFamilies;