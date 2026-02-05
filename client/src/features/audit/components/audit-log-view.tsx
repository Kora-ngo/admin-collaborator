import { useState } from "react";
import StatusBadge from "../../../components/widgets/status-badge";
import DetailView from "../../../components/widgets/detail-view";
import { formatDate } from "../../../utils/formatDate";

interface AuditLogViewProps {
  log: any;
}

type Tab = "general" | "additional";

const AuditLogView = ({ log }: AuditLogViewProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("general");

  if (!log) {
    return (
      <div className="text-center py-10 text-gray-500">
        No audit log data available
      </div>
    );
  }

  const getActionColor = (action: string) => {
    if (action.includes('created') || action.includes('login')) return 'green';
    if (action.includes('approved')) return 'blue';
    if (action.includes('rejected') || action.includes('deleted')) return 'red';
    if (action.includes('updated') || action.includes('edited')) return 'yellow';
    return 'gray';
  };

  const tabs = [
    {
      key: "general" as Tab,
      label: "General Details",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
    },
    {
      key: "additional" as Tab,
      label: "Additional Details",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      ),
    },
  ];

  const renderGeneralTab = () => (
    <DetailView
      title="Audit Log Details"
      subtitle={`Logged on ${formatDate(log.created_at, true) || "N/A"}`}
      layout="double"
      fields={[
        {
          label: "Actor",
          value: (
            <div>
              <p className="font-medium text-gray-900">
                {log.actor?.user?.name || "Unknown"}
              </p>
            </div>
          )
        },
        {
          label: "Contact",
          value: (
            <div>
              <p className="text-sm text-gray-500">
                {log.actor?.user?.email || "-"}
              </p>
            </div>
          )
        },
        {
          label: "Role",
          value: (
            <StatusBadge 
              text={log.actor_role} 
              color={
                log.actor_role === 'admin' ? 'purple' : 
                log.actor_role === 'collaborator' ? 'blue' : 
                'green'
              } 
            />
          )
        },
        {
          label: "Action",
          value: (
            <StatusBadge 
              text={log.action} 
              color={getActionColor(log.action)} 
            />
          )
        },
        {
          label: "Entity Type",
          value: (
            <p className="font-medium text-gray-900 capitalize">
              {log.entity_type}
            </p>
          )
        },
        ...(log.entity_id ? [{
          label: "Entity ID",
          value: (
            <p className="font-medium text-gray-900">
              #{log.entity_id}
            </p>
          )
        }] : []),
        ...(log.batch_uid ? [{
          label: "Batch UID",
          value: (
            <p className="font-medium text-gray-900">
              {log.batch_uid}
            </p>
          )
        }] : []),
        {
          label: "Platform",
          value: (
            <StatusBadge 
              text={log.platform} 
              color={log.platform === 'web' ? 'blue' : 'green'} 
            />
          )
        },
        // {
        //   label: "IP Address",
        //   value: (
        //     <p className="font-medium text-gray-900">
        //       {log.ip_address || "-"}
        //     </p>
        //   )
        // }
      ]}
    />
  );

const renderAdditionalTab = () => {
  // Check if metadata exists and is a non-empty object
  const hasMetadata = log.metadata;
  const realdata = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata

  Object.entries(realdata).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});


  return (
    <div className="space-y-3">
        <p className="font-medium text-gray-600">Affected Record</p>
      <div className="border border-gray-200 rounded-sm overflow-hidden bg-white">
        {/* Content */}
        {hasMetadata ? (
          <div className="divide-y divide-gray-200">
            {Object.entries(realdata).map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Label */}
                <div className="text-sm font-medium text-gray-500 capitalize md:col-span-1">
                  {key} {/* e.g. "created_at" → "created at" */}
                </div>

                {/* Value */}
                <div className="text-sm font-medium text-gray-900 md:col-span-2">
                  {String(value)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            No additional metadata available
          </div>
        )}
      </div>
    </div>
  );
};

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
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
        {activeTab === "general" && renderGeneralTab()}
        {activeTab === "additional" && renderAdditionalTab()}
      </div>
    </div>
  );
};

export default AuditLogView;