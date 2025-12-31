// components/ui/DetailView.tsx

import type { ReactNode } from "react";

interface DetailField {
  label: string;
  value: ReactNode; // Allows strings, numbers, JSX, formatted dates, etc.
}

interface DetailViewProps {
  title: string;
  subtitle?: string;
  fields: DetailField[];
  className?: string;
}

const DetailView = ({
  fields,
  className = "",
}: DetailViewProps) => {
  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="overflow-hidden">

        {/* Fields */}
        <div className="divide-y divide-gray-200">
          {fields.map((field) => (
            <div
              key={field.label}
              className="grid grid-cols-3 gap-4 py-4 hover:bg-muted/30 transition-colors"
            >
              <div className="text-sm font-medium text-gray-500">
                {field.label}
              </div>
              <div className="col-span-2 text-sm text-gray-900 font-semibold">
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