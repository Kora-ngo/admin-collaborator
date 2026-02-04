import { formatDate } from "../../../utils/formatDate";
import StatusBadge from "../../../components/widgets/status-badge";

interface AuditLogViewProps {
    log: any;
}

const AuditLogView = ({ log }: AuditLogViewProps) => {
    if (!log) {
        return (
            <div className="text-center py-10 text-gray-500">
                No data available
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                    {log.action}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    {formatDate(log.created_at, true)}
                </p>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-500">Actor</p>
                    <p className="font-medium text-gray-900">
                        {log.actor?.user?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                        {log.actor?.user?.email || "-"}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <StatusBadge 
                        text={log.actor_role} 
                        color={log.actor_role === 'admin' ? 'purple' : log.actor_role === 'collaborator' ? 'blue' : 'green'} 
                    />
                </div>

                <div>
                    <p className="text-sm text-gray-500">Action</p>
                    <StatusBadge text={log.action} color={getActionColor(log.action)} />
                </div>

                <div>
                    <p className="text-sm text-gray-500">Entity Type</p>
                    <p className="font-medium text-gray-900 capitalize">{log.entity_type}</p>
                </div>

                {log.entity_id && (
                    <div>
                        <p className="text-sm text-gray-500">Entity ID</p>
                        <p className="font-medium text-gray-900">#{log.entity_id}</p>
                    </div>
                )}

                {log.batch_uid && (
                    <div>
                        <p className="text-sm text-gray-500">Batch UID</p>
                        <p className="font-medium text-gray-900">{log.batch_uid}</p>
                    </div>
                )}

                <div>
                    <p className="text-sm text-gray-500">Platform</p>
                    <StatusBadge 
                        text={log.platform} 
                        color={log.platform === 'web' ? 'blue' : 'green'} 
                    />
                </div>

                <div>
                    <p className="text-sm text-gray-500">IP Address</p>
                    <p className="font-medium text-gray-900">{log.ip_address || "-"}</p>
                </div>
            </div>

            {/* Metadata */}
            {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="mt-6">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Additional Details</p>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-auto max-h-96">
                            {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogView;