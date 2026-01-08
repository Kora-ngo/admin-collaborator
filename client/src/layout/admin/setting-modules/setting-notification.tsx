import EmptyState from "../../../components/widgets/empty";

const SettingNotifications = () => {
    return ( 
        <div>
            <EmptyState 
                variant="inProgress" 
                title="Module under Progress"
                description="This Module is still under working progress"
                />
        </div>
     );
}
 
export default SettingNotifications;