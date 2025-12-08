import { Outlet } from "react-router-dom";
import Navbar from "./nav-bar";
import SideBar from "./side-bar";
import { useState } from "react";

const Home = () => {

        const [isSidebarOpen, setIsSidebarOpen] = useState(false);

        const toggleSidebar = () => {
            setIsSidebarOpen(!isSidebarOpen);
        }


    return ( 
      <div className="bg-white border-gray-200">
       <SideBar isOpen={isSidebarOpen} toggleSideBar={toggleSidebar} />
        <div className="sm:ml-64 h-screen">
          <div className="navbar">
            <Navbar toggleSidebar={toggleSidebar} />
          </div>
          <div className="p-4 content">
            <Outlet />
          </div>
        </div>

      </div>
     );
}
 
export default Home;