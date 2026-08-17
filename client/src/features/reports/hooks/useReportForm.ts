import { useEffect, useState } from "react";
import { useReportStore } from "../store/reportStore";
import { useProjectStore } from "../../project/store/projectStore";
import { useToastStore } from "../../../store/toastStore";
import { optionMeta } from "../utils/optionMeta";
import type { GenerateReportPayload, ReportFormat, ReportOptions, ReportType } from "../types/report";

const defaultOptions: ReportOptions = {
    projectDocumentation: false,
    beneficiaries: false,
    assistance: false,
    charts: false,
};

export const useReportForm = (isOpen: boolean) => {
    const { generating, generateReport } = useReportStore();
    const { data: projects, getData: getProjects } = useProjectStore();
    const showToast = useToastStore((state) => state.showToast);

    const [projectId, setProjectId] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [options, setOptions] = useState<ReportOptions>(defaultOptions);

    const [errors, setErrors] = useState({
        projectId: false,
        from: false,
        to: false,
    });

    useEffect(() => {
        getProjects();
    }, [getProjects]);

    useEffect(() => {
        if (isOpen) {
            handleClearForm();
        }
    }, [isOpen]);

    const toggleOption = (key: keyof ReportOptions) => {
        setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleClearForm = () => {
        setProjectId("");
        setFrom("");
        setTo("");
        setOptions(defaultOptions);
        setErrors({ projectId: false, from: false, to: false });
    };

    // Derived from selection — one option picked = its own type/format;
    // more than one = bundled as a DATA_PACKAGE ZIP.
    const selectedKeys = (Object.keys(options) as (keyof ReportOptions)[]).filter((key) => options[key]);

    const derived: { type: ReportType; format: ReportFormat } | null =
        selectedKeys.length === 0
            ? null
            : selectedKeys.length === 1
            ? { type: optionMeta[selectedKeys[0]].type, format: optionMeta[selectedKeys[0]].format }
            : { type: "DATA_PACKAGE", format: "ZIP" };

    const canSubmit = selectedKeys.length > 0 && !generating;

    const handleSubmit = async (): Promise<boolean> => {
        const formErrors = {
            projectId: !projectId,
            from: !from,
            to: !to,
        };
        setErrors(formErrors);

        if (Object.values(formErrors).some(Boolean)) {
            return false;
        }

        if (!derived) {
            showToast({ type: "error", message: "Select at least one item to include in the report." });
            return false;
        }

        if (from > to) {
            showToast({ type: "error", message: "The 'From' date must be before the 'To' date." });
            return false;
        }

        const payload: GenerateReportPayload = {
            projectId,
            type: derived.type,
            format: derived.format,
            reportingPeriod: { from, to },
            options,
        };

        const result = await generateReport(payload);
        showToast(result);

        if (result.type === "success") {
            handleClearForm();
            return true;
        }

        return false;
    };

    return {
        projects,
        projectId,
        setProjectId,
        from,
        setFrom,
        to,
        setTo,
        options,
        toggleOption,
        selectedKeys,
        derived,
        canSubmit,
        errors,
        generating,
        handleSubmit,
    };
};