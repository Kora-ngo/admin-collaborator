import { useEffect, useState } from "react";
import ActionIcon from "../../../components/ui/action-icon";
import EmptyState from "../../../components/ui/empty";
import Loading from "../../../components/ui/loading";
import { useAssistanceTypeStore } from "../store/assistanceTypeStore";
import { useAssistance } from "../hooks/useAssistance";

const TypeView = () => {
    const { data, loading, fetchData } = useAssistanceTypeStore();
    const { handleDelete } = useAssistance();

    const [confirmId, setConfirmId] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const confirmDelete = async (id: number) => {
        await handleDelete(id);
        setConfirmId(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loading text="Loading assistance types..." />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 max-w-4xl">
            {data.length === 0 ? (
                <div className="bg-gray-50 rounded-xl">
                    <EmptyState title="No Assistance Type Found" />
                </div>
            ) : (
                <div className="border border-gray-100 rounded-xl divide-y divide-gray-50 overflow-hidden">
                    {data.map((t) => (
                        <div key={t.id}>
                            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                                    <p className="text-xs text-gray-400">{t.unit}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* <ActionIcon name="edit" /> */}
                                    <ActionIcon name="trash" onClick={() => setConfirmId(t.id)} />
                                </div>
                            </div>

                            {confirmId === t.id && (
                                <div className="flex items-center justify-between gap-3 px-4 py-2 bg-red-50 border-t border-red-100">
                                    <p className="text-xs font-medium text-red-700">
                                        Delete "{t.name}"?
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setConfirmId(null)}
                                            className="text-xs text-gray-500 hover:text-gray-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(t.id)}
                                            className="text-xs font-semibold text-red-600 hover:text-red-800"
                                        >
                                            Confirm Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TypeView;