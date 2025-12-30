import { useCallback, useEffect, useState } from "react";
import ActionIcon from "../../../components/widgets/action-icon";
import EmptyState from "../../../components/widgets/empty";
import { useAssistanceTypeStore } from "../store/assistanceTypeStore";
import { useAssistance } from "../hooks/useAssistance";

const TypeView = () => {

    const {data, loading, fetchData} = useAssistanceTypeStore();
    const {handleDelete} = useAssistance();

    const CONFIRM_TIMEOUT = 5000; // 5 seconds

    // Track which type is pending deletion (by id)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // Timer to auto-cancel confirmation
  useEffect(() => {
    if (pendingDeleteId === null) return;

    const timer = setTimeout(() => {
      setPendingDeleteId(null);
    }, CONFIRM_TIMEOUT);

    return () => clearTimeout(timer);
  }, [pendingDeleteId]);

  // Handle trash click
  const handleTrashClick = useCallback((id: number) => {
    if (pendingDeleteId === id) {
      // Second click → actually delete
        handleDelete(id);
      setPendingDeleteId(null); // Reset immediately
    } else {
      // First click → enter confirm mode
      setPendingDeleteId(id);
    }
  }, [pendingDeleteId]);

  const cancelDelete = () => {
    setPendingDeleteId(null);
  };

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    if(loading){
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    return ( 
          <div className="flex flex-col gap-6 max-w-4xl">
      <div className="space-y-2">
        {data.length === 0 ? (
          <div className="flex flex-row h-[70vh] items-center">
            <EmptyState variant="empty" title="No Assistance Type Found" />
          </div>
        ) : (
          <>
            {data.map((t) => (
              <div
                key={t.id}
                className="bg-muted/50 rounded-sm overflow-hidden py-2 px-4 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-lg">{t.name}</h3>
                    <p className="font-medium text-sm text-gray-500">{t.unit}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* <ActionIcon name="edit" /> */}
                    
                    <ActionIcon
                      name="trash"
                      onClick={() => handleTrashClick(t.id)}
                      className={pendingDeleteId === t.id ? "text-red-600" : ""}
                    />
                  </div>
                </div>

                {/* Confirmation Message */}
                {pendingDeleteId === t.id && (
                  <div className="mt-3 pt-3 border border-red-200 bg-red-50 rounded-md px-4 py-3 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm font-medium text-red-800">
                      Click the trash icon again to delete "{t.name}"
                    </p>
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={cancelDelete}
                        className="text-sm text-red-600 hover:text-red-800 underline"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-xs text-red-600 mt-1 text-right">
                      Auto-cancels in 5s
                    </p>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
     );
}
 
export default TypeView;