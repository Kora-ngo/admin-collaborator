import { useAuthStore } from "../../features/auth/store/authStore";
import AdminDashbaord from "../../features/dashbaord/components/admin-dashboard";
import CollaboratorDashboard from "../../features/dashbaord/components/collaborator-dashboard";

const Dashboard = () => {
    const {role} = useAuthStore();
    
    if(role === "collaborator")
    return <CollaboratorDashboard />

    return <AdminDashbaord />
}

export default Dashboard;