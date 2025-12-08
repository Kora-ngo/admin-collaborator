
interface NavbarProps {
    toggleSidebar: () => void;
}


const Navbar: React.FC<NavbarProps> = ({toggleSidebar}) => {
    return ( 
            <header className="antialiased ">
                This is the header
            </header>
     );
}
 
export default Navbar;