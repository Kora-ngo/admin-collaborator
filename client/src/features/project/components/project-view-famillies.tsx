import EmptyState from "../../../components/widgets/empty";
import { useAuthStore } from "../../auth/store/authStore";

const ProjectViewFamilies = () => {
    const {membership} = useAuthStore();
    return ( 
        <div className="flex justify-center items-center h-80">
            <EmptyState
                title="No Record Found"
                description={
                    membership?.role === "admin" ?
                    "Collaborators and/or Enumerators are the one responsible for filling in this records on their dashbaord" :
                    "No Record available, The Filling process will be done by the assigned Enumerators"
                }
            />
        </div>
     );
}
 
export default ProjectViewFamilies;