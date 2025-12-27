import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./nav-bar";
import SideBar from "./side-bar";
import { useState } from "react";
import Popup from "../components/widgets/popup";
import { useAuthStore } from "../features/auth/store/authStore";

const Home = () => {

      const [isSidebarOpen, setIsSidebarOpen] = useState(false);

      const [showLogoutPopup, setShowLogoutPopup] = useState(false);
      const {logout} = useAuthStore();

      const toggleSidebar = () => {
          setIsSidebarOpen(!isSidebarOpen);
      }

      const handleLogout = () => {
        logout();
      }


    return ( 
      <div className="bg-white border-gray-200">
       <SideBar isOpen={isSidebarOpen} toggleSideBar={toggleSidebar} onLogoutClick={() => setShowLogoutPopup(true)} />
        <div className="sm:ml-64 h-screen">
          <div className="navbar">
            <Navbar toggleSidebar={toggleSidebar} />
          </div>
          <div className="p-4 content">
            <Outlet />
          </div>
        </div>
      <Popup
        open={showLogoutPopup}  // Change to state later
        onClose={() => setShowLogoutPopup(false)}
        title="Logout"
        description="Are you sure you want to log out?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        confirmButtonClass="bg-primary hover:bg-primary/80"
      />
      </div>
     );
}
 
export default Home;