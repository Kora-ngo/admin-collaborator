import { useEffect } from "react";
import EmptyState from "../../../components/widgets/empty";
import type { Delivery } from "../../../types/delivery";
import { useAuthStore } from "../../auth/store/authStore";
import Accordion from "../../../components/widgets/accordion";


interface ProjectViewDeliveryProps {
    selectedDelivery: Delivery[] |undefined
}

const ProjectViewDeliverires = ({selectedDelivery}: ProjectViewDeliveryProps) => {
    const {membership} = useAuthStore();

    useEffect(() => {
    }, [selectedDelivery])

    if(!selectedDelivery || selectedDelivery.length === 0)
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
        selectedDelivery.map((delivery: any) => (
            <Accordion
            items={[
                    {
                        title: delivery.beneficiary.family_code,
                        subtitle: `Family Head: ${delivery.beneficiary.head_name}`,
                        count: delivery.items.length,
                        subTiles: delivery.items?.map((item: any) => ({
                        title: item.assistance.name,
                        // subtitle: member.relationship,
                        iconLeading: (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-primary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
                        </svg>
                        ),
                        content: (
                            <div className="flex text-sm text-gray-600">
                                <p>{item.assistance.assistanceType.name} ({item.assistance.assistanceType.unit})</p>
                                <span className="px-2">-</span>
                                <span className="text-primary font-bold">{item.quantity}</span>
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
 
export default ProjectViewDeliverires;