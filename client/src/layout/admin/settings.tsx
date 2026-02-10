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
  const {organisation, user} = useAuthStore();

  const unActiveMenu =
    "w-full flex items-center p-2 pr-10 text-gray-900 rounded-md hover:bg-gray-100 transition-all duration-300 ease-in-out group";

  const activeMenu =
    "w-full flex items-center p-2 pr-10 text-gray-900 bg-secondary rounded-md hover:bg-secondary/80 transition-all duration-300 ease-in-out group";

  const unActiveIcon = "size-5 text-secondary-foreground";
  const activeIcon = "size-5 text-white";

  const getTabDisplayName = (tab: SettingsTab) => {
    return tab
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="h-[70vh] flex space-x-8">
      {/* Sidebar */}
      <div className="border-r border-gray-200">
        <ul className="space-y-3 font-medium mr-4">
          {/* Account */}
          <li>
            <button
              onClick={() => setActiveTab("account")}
              className={activeTab === "account" ? activeMenu : unActiveMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={activeTab === "account" ? activeIcon : unActiveIcon}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
              <span className={`px-2 text-sm ${activeTab === "account" ? "text-white" : ""}`}>
                Account
              </span>
            </button>
          </li>

          {/* Organisation */}
          <li>
            <button
              onClick={() => setActiveTab("organisation")}
              className={activeTab === "organisation" ? activeMenu : unActiveMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={activeTab === "organisation" ? activeIcon : unActiveIcon}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21"
                />
              </svg>
              <span className={`px-2 text-sm ${activeTab === "organisation" ? "text-white" : ""}`}>
                Organisation
              </span>
            </button>
          </li>

          {/* Notifications */}
          {/* <li>
            <button
              onClick={() => setActiveTab("notifications")}
              className={activeTab === "notifications" ? activeMenu : unActiveMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={activeTab === "notifications" ? activeIcon : unActiveIcon}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
              <span className={`px-2 text-sm ${activeTab === "notifications" ? "text-white" : ""}`}>
                Notifications
              </span>
            </button>
          </li> */}

          {/* Data Privacy */}
          {/* <li>
            <button
              onClick={() => setActiveTab("data-privacy")}
              className={activeTab === "data-privacy" ? activeMenu : unActiveMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={activeTab === "data-privacy" ? activeIcon : unActiveIcon}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
              <span className={`px-2 text-sm ${activeTab === "data-privacy" ? "text-white" : ""}`}>
                Data Privacy
              </span>
            </button>
          </li> */}

          {/* Subscription & Billing */}
          {
            organisation?.created_by === user?.id &&
            (
              <li>
                <button
                  onClick={() => setActiveTab("subscription-billing")}
                  className={activeTab === "subscription-billing" ? activeMenu : unActiveMenu}
                >

                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={activeTab === "subscription-billing" ? activeIcon : unActiveIcon}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>

                  <span className={`px-2 text-sm ${activeTab === "subscription-billing" ? "text-white" : ""}`}>
                    Subscription
                  </span>
                </button>
            </li>
            )
          }

          {/* Help & Support */}
          <li>
            <button
              onClick={() => setActiveTab("help-support")}
              className={activeTab === "help-support" ? activeMenu : unActiveMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={activeTab === "help-support" ? activeIcon : unActiveIcon}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                />
              </svg>
              <span className={`px-2 text-sm ${activeTab === "help-support" ? "text-white" : ""}`}>
                Help & Support
              </span>
            </button>
          </li>

          {/* Language */}
          {/* <li>
            <button
              onClick={() => setActiveTab("language")}
              className={activeTab === "language" ? activeMenu : unActiveMenu}
            >

              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={activeTab === "language" ? activeIcon : unActiveIcon}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>

              <span className={`px-2 text-sm ${activeTab === "language" ? "text-white" : ""}`}>
                Language
              </span>
            </button>
          </li> */}
        </ul>
        <div className="w-full mt-40 px-4">
          <img  src={brandImg} className="h-8 opacity-50" />
          <p className="font-semibold text-sm px-7 text-gray-300">v1.0.1</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          {getTabDisplayName(activeTab)}
        </h1>

        {activeTab === "account" && <SettingAccount />}
        {activeTab === "organisation" && <SettingOrganisation />}
        {activeTab === "notifications" && <SettingNotifications />}
        {activeTab === "data-privacy" && <SettingDataPrivacy />}
        {activeTab === "subscription-billing" && <SettingSubscription /> }
        {activeTab === "help-support" && <SettingHelp />}
        {activeTab === "language" && (
          <div className="text-gray-600">Language preferences coming soon...</div>
          // <SettingLanguage />
        )}
      </div>
    </div>
  );
};

export default Settings;