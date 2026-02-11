"use client";

import { useState } from "react";
import SettingAccount from "../admin/setting-modules/setting-account";
import SettingOrganisation from "../admin/setting-modules/setting-organisation";
import SettingNotifications from "./setting-modules/setting-notification";
import SettingDataPrivacy from "./setting-modules/setting-data-privacy";
import SettingSubscription from "./setting-modules/setting-subscription";
import SettingHelp from "./setting-modules/setting-help";
import brandImg from "../../assets/icons/brand.png";
import { useAuthStore } from "../../features/auth/store/authStore";

type SettingsTab =
  | "account"
  | "organisation"
  | "notifications"
  | "data-privacy"
  | "subscription-billing"
  | "help-support"
  | "language";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const { organisation, user } = useAuthStore();

  // ────────────────────────────────────────────────
  // Desktop sidebar styles (UNTOUCHED – exactly your original)
  // ────────────────────────────────────────────────
  const unActiveMenu =
    "w-full flex items-center p-2 pr-10 text-gray-900 rounded-md hover:bg-gray-100 transition-all duration-300 ease-in-out group";

  const activeMenu =
    "w-full flex items-center p-2 pr-10 text-gray-900 bg-secondary rounded-md hover:bg-secondary/80 transition-all duration-300 ease-in-out group";

  const unActiveIcon = "size-5 text-secondary-foreground";
  const activeIcon = "size-5 text-white";

  // ────────────────────────────────────────────────
  // Mobile tab bar styles (NEW – pill-style, scrollable)
  // ────────────────────────────────────────────────
  const mobileTabBase =
    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap";

  const mobileActiveTab = `${mobileTabBase} bg-primary text-white shadow-sm`;
  const mobileInactiveTab = `${mobileTabBase} bg-gray-100 text-gray-700 hover:bg-gray-200`;

  // ────────────────────────────────────────────────
  // Tab configuration (shared between mobile & desktop)
  // ────────────────────────────────────────────────
  const tabs = [
    {
      key: "account" as const,
      label: "Account",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
    },
    {
      key: "organisation" as const,
      label: "Organisation",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
        </svg>
      ),
    },
    ...(organisation?.created_by === user?.id
      ? [
          {
            key: "subscription-billing" as const,
            label: "Subscription",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            ),
          },
        ]
      : []),
    {
      key: "help-support" as const,
      label: "Help & Support",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
        </svg>
      ),
    },
  ];

  const getTabDisplayName = (tab: SettingsTab) => {
    return tab
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* MOBILE TAB BAR – horizontal scrollable (hidden on desktop) */}
      <div className="sm:hidden border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="overflow-x-auto scrollbar-hide px-4 py-3">
          <div className="flex space-x-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={activeTab === tab.key ? mobileActiveTab : mobileInactiveTab}
              >
                <div className={activeTab === tab.key ? activeIcon : unActiveIcon}>
                  {tab.icon}
                </div>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        {/* DESKTOP SIDEBAR – hidden on mobile, exact original style */}
        <div className="hidden sm:block w-64 border-r border-gray-200 bg-white overflow-y-auto">
          <ul className="space-y-3 p-4 font-medium">
            {tabs.map((tab) => (
              <li key={tab.key}>
                <button
                  onClick={() => setActiveTab(tab.key)}
                  className={activeTab === tab.key ? activeMenu : unActiveMenu}
                >
                  <div className={activeTab === tab.key ? activeIcon : unActiveIcon}>
                    {tab.icon}
                  </div>
                  <span className={`px-2 text-sm ${activeTab === tab.key ? "text-white" : ""}`}>
                    {tab.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* Branding footer – desktop only */}
          <div className="mt-40 px-6">
            <img src={brandImg} className="h-8 opacity-50" alt="Brand" />
            <p className="font-semibold text-sm ml-6 text-gray-300 mt-2">v1.0.1</p>
          </div>
        </div>

        {/* CONTENT AREA – full width on mobile, flex-1 on desktop */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              {getTabDisplayName(activeTab)}
            </h1>

            {activeTab === "account" && <SettingAccount />}
            {activeTab === "organisation" && <SettingOrganisation />}
            {activeTab === "notifications" && <SettingNotifications />}
            {activeTab === "data-privacy" && <SettingDataPrivacy />}
            {activeTab === "subscription-billing" && <SettingSubscription />}
            {activeTab === "help-support" && <SettingHelp />}
            {activeTab === "language" && (
              <div className="text-center text-gray-600 py-12">
                Language preferences coming soon...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;