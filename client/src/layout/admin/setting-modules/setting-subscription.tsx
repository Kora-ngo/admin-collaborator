import { useEffect } from "react";
import { useAuthStore } from "../../../features/auth/store/authStore";
import StatusBadge from "../../../components/widgets/status-badge";
import { formatDate } from "../../../utils/formatDate";
import { getDaysLeftForSubscription } from "../../../utils/differenceInDays";

const SettingSubscription = () => {

    const {subscription} = useAuthStore();

    useEffect(() => {
        console.log("Hello World --> ", subscription);
    }, [])

    return ( 
        <div>
            <div className="relative border rounded-md border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-400">Subscription Plan</p>
                        <p className="text-md font-medium">{subscription ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : "User"}</p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-400">Subscription Status</p>
                        <StatusBadge text={subscription?.status === "true" ? "Active" : "Inactive"} color="purple" />
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-400">Expired At</p>
                        <p className="text-md font-medium">{formatDate(subscription?.expiresAt!, false)}</p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-400">Days Left</p>
                        <p className="text-md font-medium">{getDaysLeftForSubscription(subscription?.expiresAt!)+ " Days"}</p>
                    </div>
                </div>
            </div>
            <div className="mt-4 w-100">
                <div className="col-span-1 sm:col-span-3 p-4 bg-accent/20 border border-primary rounded-lg">
                    <p className="text-sm text-primary font-medium">
                        To renew your subscription, contact - <span className="font-bold">kora.support@ngo.com</span>
                    </p>
                </div>
            </div>
        </div>
     );
}
 
export default SettingSubscription;