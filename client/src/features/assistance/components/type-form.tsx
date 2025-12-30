import { Button } from "../../../components/widgets/button";
import { Input } from "../../../components/widgets/input";
import type { AssistanceType } from "../../../types/assistance";
import { useAssistance } from "../hooks/useAssistance";

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
            <p className="text-md font-semibold text-gray-500">Enter the Assistnant Type and it's Unit</p>
            <div className="flex flex-col gap-2 max-w-4xl mt-6">
 
                    {types.map((type, index) => (
                    <div key={type.id} className="flex flex-col">
                        <div className="flex gap-4 items-center">
                        <Input
                            id="name"
                            name="name"
                            value={type.name}
                            onChange={(e) => handleTypeChange(type.id, "name", e.target.value)}
                            hasError={typeErrors[index]?.name}
                            maxLength={80}
                            placeholder="E.G: Monetary"
                            className="flex-1"
                        />
                        <Input
                            id="unit"
                            name="unit"
                            value={type.unit}
                            onChange={(e) => handleTypeChange(type.id, "unit", e.target.value)}
                            hasError={typeErrors[index]?.unit}
                            maxLength={80}
                            placeholder="E.G: FCFA"
                            className="flex-1"
                        />

                        {/* Delete button - hidden for the first row */}
                        {index > 0 && (
                            <Button
                            type="button"
                            variant="link"
                            size="icon"
                            className="w-10 h-10"
                            onClick={() => removeType(type.id)}
                            >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-5"
                            >
                                <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18 18 6M6 6l12 12"
                                />
                            </svg>
                            </Button>
                        )}

                        {/* Placeholder for alignment when no delete button (first row) */}
                        {index === 0 && <div className="w-10 h-10" />}
                        </div>
                    </div>
                    ))}
                    <div>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-fit"
                            disabled={types.length === 5 ? true : false}
                            onClick={addNewType}
                            >
                            + New Type
                        </Button>
            </div>
        </div>
    </div>
     );
}
 
export default TypeForm;