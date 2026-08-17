import type { DeliveryItem } from "../delivery";
import EmptyState from "../../../components/ui/empty";

interface DeliveryViewItemsProps {
    items: DeliveryItem[];
}

const DeliveryViewItems = ({ items }: DeliveryViewItemsProps) => {
    if (!items || items.length === 0) {
        return (
            <EmptyState
                title="No Delivery Items"
                description="No items have been added to this delivery."
            />
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Delivery Items ({items.length})
            </h3>

            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-4 px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-primary">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                            </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {item.assistance?.name || "-"}
                            </p>
                            <p className="text-xs text-gray-400">
                                {item.assistance?.assistanceType?.name || "-"}
                            </p>
                        </div>

                        <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md flex-shrink-0">
                            {item.quantity} {item.assistance?.assistanceType?.unit || ""}
                        </span>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Summary</h4>
                <div className="space-y-2">
                    {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                                {item.assistance?.name} ({item.assistance?.assistanceType?.name})
                            </span>
                            <span className="font-semibold text-gray-900">
                                {item.quantity} {item.assistance?.assistanceType?.unit}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DeliveryViewItems;