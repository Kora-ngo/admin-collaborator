import { useState } from "react";
import OrganisationView from "../features/components/organisation-view";
import OrganisationForm from "../features/components/organisation-form";

const SettingOrganisation = () => {

        const [accountToggle, setAcctountToggle] = useState<'view' | 'edit'>('view');

    return ( 
        <>
        {
            accountToggle === "view" ?
            <OrganisationView onToggle={() => setAcctountToggle('edit')} />
            :
            <OrganisationForm onToggle={() => setAcctountToggle('view')} />
        }
        </>
     );
}
 
export default SettingOrganisation;