import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

interface ProtectedRouteProps {
    allowedRole: "admin" | "collaborator";
    user: any;
    children: ReactNode;
} 

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole, user, children}) => {
    if (!user) return <Navigate to="/" />
    if(user.role !== allowedRole) return <Navigate to ="/" />

    return children;
}

export default ProtectedRoute;