import { Outlet } from "react-router-dom";
import Navbar from "./nav-bar";
import SideBar from "./side-bar";
import { useState } from "react";
import Popup from "../components/widgets/popup";
import { useAuthStore } from "../features/auth/store/authStore";
import SettingModal from "../components/widgets/setting-modal";
import Settings from "../layout/admin/settings";
import { Button } from "../components/widgets/button";
import notification from "../assets/icons/google_alerts.png";

const Home = () => {

      const [isSidebarOpen, setIsSidebarOpen] = useState(false);
      const toggleSidebar = () => {
          setIsSidebarOpen(!isSidebarOpen);
      }
      

      const [showLogoutPopup, setShowLogoutPopup] = useState(false);
      const {logout, subscriptionStatus, user, membership, organisation} = useAuthStore();

      const handleLogout = () => {
        logout();
      }


      // Check if current user is the organization owner
      const isOwner = user?.id === organisation?.created_by;

      // Show blocking subscription modal only for owner when expired
      const showSubscriptionBlock = membership?.role == "admin" && subscriptionStatus === 'expired';



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

        {/* BLOCKING SUBSCRIPTION MODAL - only for owner when expired */}
      {showSubscriptionBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-8 text-start">
            <div className="mb-4 flex items-center justify-start space-x-3">
              <img src={notification} className="size-10" />
              <h2 className="text-xl font-bold text-primary">
                Subscription Expired
              </h2>
            </div>


            <div className="flex space-x-3 items-center bg-primary/10 p-3 my-5 rounded-sm">
              <div className="bg-primary w-3 h-24 rounded-xl"></div>
                {
                  isOwner ? 
                  (
                    <div className="flex flex-col">
                      <p className="text-md text-primary font-bold mb-1">WARNING</p>
                      <p className="text-start text-sm font-medium text-gray-600 ">
                          Your organization's subscription has expired. As the owner, you need to renew to continue managing projects and accessing full features.
                      </p>
                    </div>
                  ) :

                  (
                    <p className="text-start text-sm font-medium text-gray-500 ">
                        Organisation subscription has expired. Contact the owner.
                    </p>
                  )
                }
            </div>



            {
              isOwner && (
                <div>
                  <Button onClick={() => {}} className="w-full py-3 text-lg"> Renew Subscription Now</Button>

                  <p className="mt-6 text-sm text-gray-500">
                    Other team members like <span className="text-primary font-medium">Collaborators</span> and <span className="text-primary font-medium">Enumerators</span> can still view the dashboard, but full functionality requires an active plan.
                  </p>
                  {/* <hr className="text-gray-200 my-3" />
                    <p className="mt-6 text-sm text-gray-500">
                      Other team members like <span className="text-primary font-medium">Collaborators</span> and <span className="text-primary font-medium">Enumerators</span> can still view the dashboard, but full functionality requires an active plan.
                    </p> */}
                </div>
              )
            }
          </div>
        </div>
      )}

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