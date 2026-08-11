interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: React.ReactNode;
    description?: string;
}

const Switch = ({ checked, onChange, disabled = false, label, description }: SwitchProps) => {
    return (
        <div className={`flex items-start justify-between gap-4 ${disabled ? "opacity-60" : ""}`}>
            {(label || description) && (
                <div className="min-w-0">
                    {label && <p className="text-sm font-medium text-gray-800">{label}</p>}
                    {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
                </div>
            )}

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    checked ? "bg-primary" : "bg-gray-200"
                } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
                <span
                    className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${
                        checked ? "translate-x-6" : "translate-x-1"
                    }`}
                />
            </button>
        </div>
    );
};

export default Switch;