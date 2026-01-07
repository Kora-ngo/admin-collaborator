import EmptyState from "../../../components/widgets/empty";

const ProjectViewFamilies = () => {
    return ( 
        <div className="flex justify-center items-center h-80">
            <EmptyState
                title="No Record Found"
                description="Collaborators and/or Enumerators are the one responsible for filling in this records on their dashbaord"
            />
        </div>
     );
}
 
export default ProjectViewFamilies;