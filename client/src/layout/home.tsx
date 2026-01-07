import { Outlet } from "react-router-dom";
import Navbar from "./nav-bar";
import SideBar from "./side-bar";
import { useState } from "react";
import Popup from "../components/widgets/popup";
import { useAuthStore } from "../features/auth/store/authStore";
import SettingModal from "../components/widgets/setting-modal";
import Settings from "../layout/admin/settings";

const Home = () => {

      const [isSidebarOpen, setIsSidebarOpen] = useState(false);
      const toggleSidebar = () => {
          setIsSidebarOpen(!isSidebarOpen);
      }
      

      const [showLogoutPopup, setShowLogoutPopup] = useState(false);
      const {logout} = useAuthStore();

      const handleLogout = () => {
        logout();
      }



      const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);


    return ( 
      <div className="bg-white border-gray-200">
       <SideBar isOpen={isSidebarOpen} toggleSideBar={toggleSidebar} onSettingClick={() => setIsSettingModalOpen(true)} onLogoutClick={() => setShowLogoutPopup(true)} />
        <div className="sm:ml-64 h-screen">
          <div className="navbar">
            <Navbar toggleSidebar={toggleSidebar} />
          </div>
          <div className="p-4 content">
            <Outlet />
          </div>
        </div>


        <SettingModal
          isOpen={isSettingModalOpen}
          onClose={() => setIsSettingModalOpen(false)}
          title="Settings"
          children={<Settings />}
        />

        <Popup
          open={showLogoutPopup} 
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