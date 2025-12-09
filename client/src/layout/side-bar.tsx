import AdminSideBar from "./admin/admin-sidebar";
import logo from "../assets/logo.svg";

interface SideBarProps {
    isOpen: boolean;
    toggleSideBar: () => void;
}

const SideBar: React.FC<SideBarProps> = ({isOpen, toggleSideBar}) => {
    return ( 
        <aside id="default-sidebar"
            className={`border-r-1 border-gray-200 fixed top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ${
                isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
            }`} aria-label="Sidebar">
                <div className="h-full px-3 py-2 overflow-y-auto bg-white">
                    <div className="flex py-3 items-center px-2 mb-4">
                        <button type="button" className="block sm:hidden  mr-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" onClick={toggleSideBar}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 ">
                                <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <div className="">
                            <img src={logo} className="size-11" />
                        </div>
                        <span className="ms-3 font-semibold text-3xl text-primary">Kora</span>
                    </div>
                    <div className="mx-2">
                        <AdminSideBar />
                    </div>
                </div>
        </aside>
     );
}
 
export default SideBar;