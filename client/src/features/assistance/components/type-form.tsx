import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import type { AssistanceType } from "../assistance";
// import { useAssistance } from "../hooks/useAssistance";

interface TypeFormProps {
  types: AssistanceType[];
  typeErrors: Array<{ name: boolean; unit: boolean }>;
  addNewType: () => void;
  removeType: (rowId: string) => void;
  handleTypeChange: (rowId: string, field: "name" | "unit", value: string) => void;
}

const TypeForm = ({
  types,
  typeErrors,
  addNewType,
  removeType,
  handleTypeChange,
}: TypeFormProps) => {

    return (
        <div>
            <p className="text-sm text-gray-500 max-w-2xl">
                Define the types of assistance your organization provides. These can be used when recording assistance delivered to beneficiaries.
            </p>

            <div className="max-w-4xl mt-6">
                {/* Column headers — shown once, not per row */}
                <div className="grid grid-cols-[1fr_1fr_40px] gap-4 px-1 mb-2">
                    <Label required={false}>Name</Label>
                    <Label required={false}>Unit</Label>
                    <span />
                </div>

                <div className="flex flex-col gap-3">
                    {types.map((type, index) => (
                        <div key={type.id} className="grid grid-cols-[1fr_1fr_40px] gap-4 items-center">
                            <Input
                                id="name"
                                name="name"
                                value={type.name}
                                onChange={(e) => handleTypeChange(type.id, "name", e.target.value)}
                                hasError={typeErrors[index]?.name}
                                maxLength={80}
                                placeholder="E.G: Monetary"
                            />
                            <Input
                                id="unit"
                                name="unit"
                                value={type.unit}
                                onChange={(e) => handleTypeChange(type.id, "unit", e.target.value)}
                                hasError={typeErrors[index]?.unit}
                                maxLength={80}
                                placeholder="E.G: FCFA"
                            />

                            {/* Delete button — hidden for the first row */}
                            {index > 0 ? (
                                <button
                                    type="button"
                                    onClick={() => removeType(type.id)}
                                    className="w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    aria-label="Remove type"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            ) : (
                                <div className="w-9 h-9" />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-3 mt-5">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-fit"
                        disabled={types.length === 5}
                        onClick={addNewType}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        New Type
                    </Button>
                    <p className="text-xs text-gray-400">
                        {types.length}/5 types added
                    </p>
                </div>
            </div>
        </div>
    );
}

export default TypeForm;