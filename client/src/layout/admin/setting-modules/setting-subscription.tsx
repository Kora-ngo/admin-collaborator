// src/features/settings/components/setting-subscription.tsx

import { useState } from "react";
import { useAuthStore } from "../../../features/auth/store/authStore";
import StatusBadge from "../../../components/widgets/status-badge";
import { formatDate } from "../../../utils/formatDate";
import { getDaysLeftForSubscription } from "../../../utils/differenceInDays";
import { useSubscription } from "../../../features/settings/hooks/useSubscription";
import Loading from "../../../components/widgets/loading";
import EmptyState from "../../../components/widgets/empty";

const SettingSubscription = () => {
  const { subscription } = useAuthStore(); // assume you add history to store later
  const { history, loading } = useSubscription();

  const [activeTab, setActiveTab] = useState<"current" | "history">("current");

  const tabs = [
    {
      key: "current" as const,
      label: "Current Plan",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
        </svg>

      ),
    },
    {
      key: "history" as const,
      label: "Subscription History",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];



   // Get status badge color and text
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      'active': { text: 'Active', color: 'green' },
      'expired': { text: 'Expired', color: 'red' },
      'cancelled': { text: 'Cancelled', color: 'orange' },
      'pending': { text: 'Pending', color: 'yellow' },
      'true': { text: 'Active', color: 'green' },
      'false': { text: 'Inactive', color: 'gray' }
    };

    return statusMap[status.toLowerCase()] || { text: status, color: 'gray' };
  };

  // Get plan badge color
  const getPlanColor = (plan: string) => {
    const planColors: Record<string, string> = {
      'free': 'bg-gray-100 text-gray-800',
      'pro': 'bg-blue-100 text-blue-800',
      'enterprise': 'bg-purple-100 text-purple-800'
    };
    return planColors[plan.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  // Current Subscription Tab Content
  const renderCurrent = () => (
    <div className="space-y-6">
      <div className="relative border rounded-md border-gray-200 p-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-500">Subscription Plan</p>
            <p className="text-lg font-medium mt-1">
              {subscription ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : "Free"}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-500">Subscription Status</p>
            <div className="mt-1">
              <StatusBadge 
                text={subscription?.status === "true" ? "Active" : "Inactive"} 
                color="purple" 
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-500">Expired At</p>
            <p className="text-lg font-medium mt-1">
              {formatDate(subscription?.expiresAt!, false) || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-500">Days Left</p>
            <p className="text-lg font-medium mt-1">
              {getDaysLeftForSubscription(subscription?.expiresAt!) + " Days"}
            </p>
          </div>
        </div>
      </div>

      {/* <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
        <p className="text-sm text-accent-800 font-medium">
          To renew your subscription, contact <span className="font-bold">kora.support@ngo.com</span>
        </p>
      </div> */}
    </div>
  );

  // History Tab Content (placeholder table - replace with real data later)
  const renderHistory = () => {

     if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loading text="Loading subscription history..." />
        </div>
      );
    }

    if (history.length === 0) {
      return (
        <div className="py-10">
          <EmptyState title="No subscription history" />
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Subscriptions</h3>
        
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
                No subscription history available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ended</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((item: any) => {
                    const badge = getStatusBadge(item.status);
                    const durationDays = Math.ceil(
                      (new Date(item.ends_at).getTime() - new Date(item.started_at).getTime()) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(item.plan)}`}>
                            {item.plan.charAt(0).toUpperCase() + item.plan.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.started_at, false)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.ends_at, false)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {durationDays} days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge text={badge.text} color={badge.color as any} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Tab Bar */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex text-sm items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === tab.key
                ? "text-primary border-primary bg-primary/5"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "current" ? renderCurrent() : renderHistory()}
      </div>
    </div>
  );
};

export default SettingSubscription;