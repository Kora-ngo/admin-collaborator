import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { SelectInput } from "../../../components/ui/select-input";
import Switch from "../../../components/ui/switch";
import { useReportForm } from "../hooks/useReportForm";
import { optionMeta } from "../utils/optionMeta";
import type { ReportOptions } from "../types/report";

interface GenerateReportFormProps {
    isOpen: boolean;
    onSuccess: () => void;
}

const optionKeys: (keyof ReportOptions)[] = ["projectDocumentation", "beneficiaries", "assistance", "charts"];

const dateIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-4 text-muted-foreground">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
);

const openPicker = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
        (e.currentTarget as HTMLInputElement).showPicker?.();
    } catch (_) {}
};

const GenerateReportForm = ({ isOpen, onSuccess }: GenerateReportFormProps) => {
    const {
        projects,
        projectId, setProjectId,
        from, setFrom,
        to, setTo,
        options, toggleOption,
        selectedKeys,
        derived,
        canSubmit,
        errors,
        generating,
        handleSubmit,
    } = useReportForm(isOpen);

    const handleValidate = async () => {
        const success = await handleSubmit();
        if (success) onSuccess();
    };

    return (
        <div className="flex flex-col justify-between w-full h-full">
            <div className="grid grid-cols-1 gap-6">
                {/* Project */}
                <div className="grid gap-2">
                    <Label htmlFor="project">Project</Label>
                    <SelectInput
                        id="project"
                        options={[
                            { label: "Select a project...", value: "" },
                            ...projects.map((p: any) => ({ label: p.name, value: String(p.id) })),
                        ]}
                        value={projectId}
                        hasError={errors.projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                    />
                </div>

                {/* Reporting Period */}
                <div className="grid gap-2">
                    <Label required={false}>Reporting Period</Label>
                    <p className="text-sm text-gray-500">
                        Must match with the project period as well so as not
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1">
                            <Input
                                id="from"
                                name="from"
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                hasError={errors.from}
                                className="cursor-pointer"
                                onClick={openPicker}
                                prefixElement={dateIcon}
                            />
                            <p className="text-xs text-gray-400">From</p>
                        </div>
                        <div className="grid gap-1">
                            <Input
                                id="to"
                                name="to"
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                hasError={errors.to}
                                className="cursor-pointer"
                                onClick={openPicker}
                                prefixElement={dateIcon}
                            />
                            <p className="text-xs text-gray-400">To</p>
                        </div>
                    </div>
                </div>

                {/* Options — format shown per-item, no separate type/format fields */}
                <div className="grid gap-2">
                    <Label required={false}>Include in Report</Label>
                    <div className="border border-gray-100 rounded-xl divide-y divide-gray-50 overflow-hidden">
                        {optionKeys.map((key) => {
                            const meta = optionMeta[key];
                            return (
                                <div key={key} className="px-4 py-3">
                                    <Switch
                                        checked={options[key]}
                                        onChange={() => toggleOption(key)}
                                        label={
                                            <span className="flex items-center gap-2">
                                                {meta.label}
                                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                                    {meta.format}
                                                </span>
                                            </span>
                                        }
                                        description={meta.description}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Summary — appears once at least one option is checked */}
                {derived && (
                    <div className="flex items-start gap-2.5 px-4 py-3 bg-primary/5 border border-primary/10 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-primary flex-shrink-0 mt-0.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                        </svg>
                        <p className="text-xs font-medium text-primary">
                            {selectedKeys.length > 1
                                ? `This will generate a ZIP archive bundling ${selectedKeys.length} files: ${selectedKeys.map((k) => optionMeta[k].label).join(", ")}.`
                                : `This will generate a single ${derived.format} file - ${optionMeta[selectedKeys[0]].label}.`}
                        </p>
                    </div>
                )}
            </div>

            <div className="border-t-1 border-gray-200 mt-8">
                <div className="my-4 flex gap-4 justify-end">
                    <Button onClick={handleValidate} loading={generating} disabled={!canSubmit}>
                        Generate Report
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default GenerateReportForm;