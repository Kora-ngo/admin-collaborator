import { Button } from "../../../components/widgets/button";
import { Label } from "../../../components/widgets/label";
import { SelectInput } from "../../../components/widgets/select-input";

const SettingDataPrivacy = () => {
  const modules = [
    { id: "project", label: "Project" },
    { id: "families", label: "Families" },
    { id: "deliveries", label: "Deliveries" },
    { id: "assistance", label: "Assistance" },
  ];

  return (
    <div className="space-y-1">
      {/* Export Data Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Export Your Data
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Select the modules you want to export and choose your preferred format.
        </p>

        {/* Modules Checkboxes */}
        <div className="grid grid-cols-2 space-y-2 mb-4">
          {modules.map((module) => (
            <label
              key={module.id}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="checkbox"
                name="modules"
                value={module.id}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <Label required={false} className="text-base font-medium text-gray-900 cursor-pointer">
                {module.label}
              </Label>
            </label>
          ))}
        </div>

        {/* Format Selection */}
        <div className="mb-8 w-50 ">
          <Label htmlFor="export-format" className="block mb-2">
            Export Format
          </Label>
          <SelectInput
            id="export-format"
            options={[
              { label: "PDF", value: "pdf" },
              { label: "Excel (XLSX)", value: "excel" },
            ]}
            className="bg-"
            defaultValue="pdf"
          />
        </div>

        {/* Export Button */}
        <Button className="w-full sm:w-auto px-8">
          Export Selected Data
        </Button>
      </div>

      {/* Privacy Info Bubbles */}
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Data Retention:</span> We retain project and beneficiary data for as long as the organization account is active.
          </p>
        </div>

        <div className="">
          <p className="text-sm text-gray-700">
            Want to know more? Read our explanation on{" "}
            <a
              href="/privacy/how-we-use-data"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:text-primary/80 underline"
            >
              How do you use people’s data?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingDataPrivacy;