import { useState } from "react";
import AccountView from "../features/components/account-view";
import AccountForm from "../features/components/account-form";

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