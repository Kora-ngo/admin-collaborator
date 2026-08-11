// components/widgets/detail-view.tsx

import type { ReactNode } from "react";

interface DetailField {
    label?: string;
    value: ReactNode;
}

interface DetailViewProps {
    title?: string;
    subtitle?: string;
    fields: DetailField[];
    className?: string;
    layout?: "single" | "double"; // "double" = label/value side by side, "single" = label above value
}

const DetailView = ({
    title,
    subtitle,
    fields,
    className = "",
    layout = "double",
}: DetailViewProps) => {
    const isSingle = layout === "single";

    return (
        <div className={`bg-white border border-gray-100 rounded-xl overflow-hidden ${className}`}>
            {(title || subtitle) && (
                <div className="px-5 py-4 border-b border-gray-100">
                    {title && <p className="text-base font-semibold text-gray-900">{title}</p>}
                    {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
                </div>
            )}

            <div className="divide-y divide-gray-50">
                {fields.map((field, index) => (
                    <div
                        key={`${field.label ?? "field"}-${index}`}
                        className={`px-5 py-3 hover:bg-gray-50/60 transition-colors ${
                            isSingle ? "" : "flex items-start justify-between gap-6"
                        }`}
                    >
                        <p className={`text-xs font-medium text-gray-600 uppercase tracking-wide flex-shrink-0 ${
                            isSingle ? "" : "w-1/3 pt-0.5"
                        }`}>
                            {field.label}
                        </p>

                        <div className={`text-sm font-semibold text-gray-900 ${
                            isSingle ? "mt-1" : "flex-1 min-w-0 text-right"
                        }`}>
                            {field.value ?? "-"}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DetailView;