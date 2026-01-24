import { useState } from "react";
import OrganisationView from "../../../features/auth/components/organisation-view";
import OrganisationForm from "../../../features/auth/components/organisation-form";
import { useAuthStore } from "../../../features/auth/store/authStore";

const SettingOrganisation = () => {

        const [accountToggle, setAcctountToggle] = useState<'view' | 'edit'>('view');
        const {organisation, user} = useAuthStore();

    return ( 
        <>
        {
            accountToggle === "view" ?
            <OrganisationView onToggle={() => setAcctountToggle('edit')} />
            :
            organisation?.created_by === user?.id ? <OrganisationForm onToggle={() => setAcctountToggle('view')} /> : <></>
        }
        </>
     );
}
 
export default SettingOrganisation;