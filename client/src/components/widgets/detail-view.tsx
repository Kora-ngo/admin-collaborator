// components/ui/DetailView.tsx

import type { ReactNode } from "react";

interface DetailField {
  label?: string;
  value: ReactNode;
}

interface DetailViewProps {
  title?: string;           // optional now (if you don't always need it)
  subtitle?: string;
  fields: DetailField[];
  className?: string;
  layout?: "single" | "double";  // NEW: control layout
}

const DetailView = ({
  title,
  subtitle,
  fields,
  className = "",
  layout = "double",  // default to current behavior
}: DetailViewProps) => {
  const isSingle = layout === "single";

  return (
    <div className={`max-w-4xl mx-auto border border-gray-200 rounded-xl ${className}`}>

      <div className="overflow-hidden">
        {/* Header Row - only shown in double layout */}
        {layout === "double" ? (
          <div className="grid grid-cols-3 gap-4 py-3 bg-gray-100 px-6">
            <p className="font-semibold text-gray-700">Label</p>
            <p className="col-span-2 font-semibold text-gray-700">Value</p>
          </div>
        )
      : 
      (
        <div className="grid grid-cols-3 gap-4 py-3 bg-gray-100 px-6">
            <p className="col-span-2 font-semibold text-gray-700">Value</p>
        </div>
      )
      
      }

        {/* Fields */}
        <div className="divide-y divide-gray-200">
          {fields.map((field, index) => (
            <div
              key={field.label! + index}
              className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                isSingle ? "grid grid-cols-1 gap-1" : "grid grid-cols-3 gap-4"
              }`}
            >
              {/* Label */}
              <div className={`${isSingle ? "text-sm font-medium text-gray-500" : "text-sm font-medium text-gray-500"}`}>
                {field.label!}
              </div>

              {/* Value */}
              <div className={`${isSingle ? "text-base font-semibold text-gray-900 mt-1" : "col-span-2 text-sm font-semibold text-gray-900"}`}>
                {field.value || "-"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailView;