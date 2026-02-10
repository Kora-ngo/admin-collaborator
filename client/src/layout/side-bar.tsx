import AdminSideBar from "./admin/admin-sidebar";
import logo from "../assets/logo.svg";
import { useAuthStore } from "../features/auth/store/authStore";
import { getDaysLeftForSubscription } from "../utils/differenceInDays";

interface SideBarProps {
    isOpen: boolean;
    toggleSideBar: () => void;
    onLogoutClick: () => void;
    onSettingClick: () => void;
}

const SideBar: React.FC<SideBarProps> = ({isOpen, toggleSideBar, onLogoutClick, onSettingClick}) => {

    const {organisation, subscription, role} = useAuthStore();
    
    return ( 
        <aside id="default-sidebar"
            className={`border-r-1 border-gray-200 fixed top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ${
                isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
            }`} aria-label="Sidebar">
                <div className="h-full px-3 py-2 overflow-y-auto bg-white">

                    <div className="flex pt-3 items-center mx-2">
                        <button type="button" className="block sm:hidden  mr-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" onClick={toggleSideBar}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 ">
                                <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <div className="flex items-center space-x-2 w-full border bg-gray-50 border-gray-300 p-1 rounded-sm">
                            <div className="bg-primary p-2 rounded-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-[14px]">{organisation?.name}</span>
                                <div className="flex space-x-2">
                                    {
                                        role === "admin" ?
                                        (
                                            <div className="flex space-x-2">
                                                <span className="text-[12px] font-medium text-gray-500">{subscription?.plan ? subscription?.plan.charAt(0).toUpperCase() + subscription?.plan.slice(1) : "Test"} Plan </span>
                                                { getDaysLeftForSubscription(subscription?.expiresAt!) < 10 ?  <span className="text-[12px] font-bold text-yellow-500">- {getDaysLeftForSubscription(subscription?.expiresAt!) + " Days"}</span> : <></> }
                                            </div>
                                        ):
                                        (<span className="text-[12px] font-medium text-gray-500">{organisation?.email ? organisation?.email : "admin@kora.com"}</span>)

                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* <div className="mt-3 mx-2 border border-amber-400 rounded-sm bg-amber-50">
                        <div className="flex items-center space-x-2 p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-amber-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                            <p className="text-[12px] font-semibold text-amber-500"> You're on Test-Mode</p>
                        </div>
                    </div> */}
                    <br />
                    {/* <div className="flex py-3 items-center px-2 mb-4">
                        <button type="button" className="block sm:hidden  mr-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" onClick={toggleSideBar}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 ">
                                <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <div className="">
                            <img src={logo} className="size-11" />
                        </div>
                        <span className="ms-3 font-semibold text-3xl text-primary">Kora</span>
                    </div> */}
                    <div className="mx-2">
                        <AdminSideBar onSettingClick={onSettingClick} onLogoutClick={onLogoutClick} />
                    </div>
                </div>
        </aside>
     );
}
 
export default SideBar;