import { useState } from "react";
import StatusBadge from "../../../../components/ui/status-badge";
import { FilterToggleButton } from "../../../../components/widgets/filter-button";
import { Button } from "../../../../components/ui/button";
import { formatDate } from "../../../../utils/formatDate";

const SettingDataProtection = () => {
      const [activeTab, setActiveTab] = useState<"Backup & Restore" | "history">("Backup & Restore");
      const [isAutomatic, setIsAutomatic] = useState(false);

      const toggleMethod = () => {
        setIsAutomatic(!isAutomatic);
      }

    const Field = ({ label, value }: { label: string; value: string | undefined }) => (
        <div className="flex flex-col gap-0.5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-sm font-medium text-gray-800">{value || "—"}</p>
        </div>
    );


     const tabs = [
        {
        key: "Backup & Restore" as const,
        label: "Backup & Restore",
        icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"  className="size-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
        </svg>


        ),
        },
        {
        key: "history" as const,
        label: "Backup History",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        },
    ];


    const renderBackUp = () => (
        <div className="space-y-6">

            <div className="flex items-center gap-4 p-5 bg-gray-100/40 rounded-xl border border-gray-200">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                    </svg>
                </div>

                <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-3">
                        <p className="text-base font-semibold text-gray-900">
                            Last Backup - <span className="text-gray-500 font-medium">Automatic</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <p className="text-sm text-gray-500 truncate">25 Jul 2026 • 5:42 PM</p> 
                        <span className="text-gray-300">|</span>
                        <StatusBadge text="Successful" color="green" />
                    </div>

                    
                </div>

                
                <div className="flex-shrink-0 px-4 py-2 text-sm font-medium text-gray-400">
                    <StatusBadge 
                        text="254 MB"
                        
                    />
                </div>
            </div>


            <p className="text-sm text-gray-500 mt-1 font-medium">
                Create a portable backup of your organization's data or restore a previously exported Kora backup.
            </p>
            <hr className="text-gray-300" />
            <div className="flex items-center">
                <div className="flex-1">
                    <p className="font-bold">Select you backup method</p>
                    {
                        isAutomatic ? 
                        (<p className="text-sm text-gray-500 mt-1 font-medium">Kora automatically creates backups on a scheduled basis to <br /> keep your organization's data protected..</p>):
                        (<p className="text-sm text-gray-500 mt-1 font-medium">Create a backup whenever you need it. Download and securely <br /> store a copy of your organization's data.</p>)
                    }
                </div>

                <div className="flex-shrink-0">
                    <FilterToggleButton showIcon={false} isOpen={isAutomatic} openText="Automatic" closedText="Mannal" onToggle={toggleMethod} />
                </div>
            </div>
            <div className="flex justify-end-safe">
                <div className="space-x-2">
                    <Button children="Restore" variant="outline" />
                    <Button children={isAutomatic ? "Activate" : "Download"} />
                </div>
            </div>
        </div>
    );
    
    const renderHistory = () => (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Backups</h3>
        
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
                No subscription history available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satus</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                </tbody>
            </table>
          </div>
        )}
      </div>
    );
   
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
            {activeTab === "Backup & Restore" ? renderBackUp() : renderHistory()}
        </div>
        </div>
    );
}
 
export default SettingDataProtection;