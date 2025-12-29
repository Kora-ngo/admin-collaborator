import { useState } from "react";
import AccountView from "../../../features/auth/components/account-view";
import AccountForm from "../../../features/auth/components/account-form";

const SettingAccount = () => {

    const [accountToggle, setAcctountToggle] = useState<'view' | 'edit'>('view');

    return ( 
        <>
        {
            accountToggle === "view" ?
            <AccountView onToggle={() => setAcctountToggle('edit')} />
            :
            <AccountForm onToggle={() => setAcctountToggle('view')} />
        }
        </>

     );
}
 
export default SettingAccount;