import { Route, Routes } from "react-router-dom";
import Home from "../../layout/home";
import Dasbaord from "./dashbaord";

const AdminRoute = () => {
    return ( 
        <Routes>
            <>
                <Route path="/" element={<Home />}>
                    <Route index element={<Dasbaord />} />
                </Route>
            </>
        </Routes>
     );
}
 
export default AdminRoute;