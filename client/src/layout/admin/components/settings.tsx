import { useState } from "react";
import SettingAccount from "./setting-account";
import SettingOrganisation from "./setting.organisation";

type SettingsTab = "account" | "organisation";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

const unActiveMenu =
  "w-full flex items-center p-2 pr-10 text-gray-900 rounded-md hover:bg-gray-100 transition-all duration-300 ease-in-out group";

const activeMenu =
  "w-full flex items-center p-2 pr-10 text-gray-900 bg-secondary rounded-md hover:bg-secondary/80 transition-all duration-300 ease-in-out group";


  const unActiveIcon = "size-5 text-secondary-foreground";
  const activeIcon = "size-5 text-white";

  return (
    <div className="h-[70vh] flex space-x-8">
      {/* Sidebar */}
      <div className="border-r border-gray-200">
        <ul className="space-y-3 font-medium mr-4">
          {/* Account */}
          <li>
            <button
              onClick={() => setActiveTab("account")}
              className={
                activeTab === "account" ? activeMenu : unActiveMenu
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={
                  activeTab === "account"
                    ? activeIcon
                    : unActiveIcon
                }
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
              <span className={`px-2 text-sm ${activeTab === "account" ? "text-white" : ""}`}>Account</span>
            </button>
          </li>

          {/* Organisation */}
          <li>
            <button
              onClick={() => setActiveTab("organisation")}
              className={
                activeTab === "organisation"
                  ? activeMenu
                  : unActiveMenu
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={
                  activeTab === "organisation"
                    ? activeIcon
                    : unActiveIcon
                }
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21"
                />
              </svg>
              <span className={`px-2 text-sm  ${activeTab === "organisation" ? "text-white" : ""}`}>Organisation</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
        {activeTab === "account" && <SettingAccount />}
        {activeTab === "organisation" && <SettingOrganisation />}
      </div>
    </div>
  );
};

export default Settings;
