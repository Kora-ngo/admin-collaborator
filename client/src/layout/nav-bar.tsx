import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../features/auth/store/authStore";

interface NavbarProps {
    toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({toggleSidebar}) => {
        const {user, role} = useAuthStore();

        const location = useLocation();


        const titles: Record<string, string> = {
        "/dashbaord": "Dashboard",
        "/dashbaord/projects": "Projects",
        "/dashbaord/users": role === "admin" ? "Members" : "Enumerators",
        "/dashbaord/families": "Families",
        "/dashbaord/assistance": "Assistance",
        "/dashbaord/deliveries": "Deliveries",
        "/dashbaord/log": "Audit Log",
        
    };

    let title = titles[location.pathname] || "Not Found"; 

    // const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

      // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            // setOpen(false);
        }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return ( 
            <header className="antialiased ">
                <nav className="px-4 lg:px-6 py-4">
                    <div className="flex flex-wrap justify-between items-center">
                        <div className="flex justify-start items-center">
                                <button
                                    data-drawer-target="default-sidebar"
                                    data-drawer-toggle="default-sidebar"
                                    aria-controls="default-sidebar"
                                    type="button"
                                    className="inline-flex items-center p-2 mr-4 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                                    onClick={toggleSidebar}
                                    >
                                    <span className="sr-only">Open sidebar</span>
                                    <svg
                                        className="w-6 h-6"
                                        aria-hidden="true"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                        clipRule="evenodd"
                                        fillRule="evenodd"
                                        d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                                        />
                                    </svg>
                                </button>
                                <span className="self-center text-2xl font-bold whitespace-nowrap">{title}</span>
                        </div>

                        <div className="relative flex items-center gap-3" ref={dropdownRef}>
                        {/* Profile Circle */}
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg uppercase cursor-pointer">
                            {user!.name ? user!.name.charAt(0) : "A"}
                        </div>

                        {/* User Info */}
                        <div className="hidden sm:flex flex-col leading-tight">
                            <span className="text-sm font-semibold text-gray-900">{user!.name || "Admin User"}</span>
                            <span className="text-xs text-gray-500">{role ? role.charAt(0).toUpperCase() + role.slice(1) : "User"}</span>
                        </div>
                        </div>

                    </div>
                </nav>
            </header>
     );
}
 
export default Navbar;