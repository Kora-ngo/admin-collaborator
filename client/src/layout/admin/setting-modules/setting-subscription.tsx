// src/features/settings/components/setting-subscription.tsx

import { useState } from "react";
import { useAuthStore } from "../../../features/auth/store/authStore";
import StatusBadge from "../../../components/widgets/status-badge";
import { formatDate } from "../../../utils/formatDate";
import { getDaysLeftForSubscription } from "../../../utils/differenceInDays";
import Table from "../../../components/widgets/table"; 

const SettingSubscription = () => {
  const { subscription } = useAuthStore(); // assume you add history to store later

  let subscriptionHistory;

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

      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
        <p className="text-sm text-accent-800 font-medium">
          To renew your subscription, contact <span className="font-bold">kora.support@ngo.com</span>
        </p>
      </div>
    </div>
  );

  // History Tab Content (placeholder table - replace with real data later)
  const renderHistory = () => {
    // Mock data - replace with real subscriptionHistory from store
    const history: any = [
    //   { plan: "free", started: "2025-01-01", ended: "2025-01-31", status: "expired" },
    //   { plan: "basic", started: "2025-02-01", ended: "2025-04-30", status: "expired" },
    //   { plan: "premium", started: "2025-05-01", ended: "2025-12-31", status: "active" },
    ];

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
                {history.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.plan.charAt(0).toUpperCase() + item.plan.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.started, false)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.ended, false)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge 
                        text={item.status.charAt(0).toUpperCase() + item.status.slice(1)} 
                        color={item.status === "active" ? "green" : "gray"} 
                      />
                    </td>
                  </tr>
                ))}
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

const tabs = [
  {
    key: "current" as const,
    label: "Current Plan",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h.75m-1.5 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    key: "history" as const,
    label: "History",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default SettingSubscription;