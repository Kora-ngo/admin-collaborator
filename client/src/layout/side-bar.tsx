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
                This is one sidebar
        </aside>
     );
}
 
export default SideBar;