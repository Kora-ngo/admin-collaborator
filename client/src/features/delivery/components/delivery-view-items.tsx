
import type { DeliveryItem } from "../../../types/delivery";
import EmptyState from "../../../components/widgets/empty";

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

    const totalItems = items.length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    Delivery Items ({totalItems})
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-semibold text-gray-900">
                                    {index + 1}. {item.assistance?.name || "-"}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {item.assistance?.assistanceType?.name || "-"}
                                </p>
                            </div>
                            <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                                {item.quantity} {item.assistance?.assistanceType?.unit || ""}
                            </span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-sm">
                            <div>
                                <p className="text-gray-500">Assistance</p>
                                <p className="font-medium text-gray-900">
                                    {item.assistance?.name || "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Type</p>
                                <p className="font-medium text-gray-900">
                                    {item.assistance?.assistanceType?.name || "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Unit</p>
                                <p className="font-medium text-gray-900">
                                    {item.assistance?.assistanceType?.unit || "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Summary</h4>
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