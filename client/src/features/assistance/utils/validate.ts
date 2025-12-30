import type { AssistanceType } from "../../../types/assistance";

export const validateAssistanceType = (
    types: AssistanceType[]
) => {

    console.log("Validate types --> ", types);


    // Validate each row (ignoring id)
    const rowErrors = types.map((type) => ({
        name: type.name.trim().length === 0,
        unit: type.unit.trim().length === 0
    }));


    // Has error if any feild in any orw is empty
    const hasErrors = rowErrors.some((row) => 
        Object.values(row).some(Boolean)
    );


    // Cleaned data: trim values and remved 'id' entirely
    const cleanedData = types.map((t) => ({
        name: t.name.trim(),
        unit: t.unit.trim()
    }));


    console.log("Validate errors --> ", rowErrors);

    return {
    hasErrors,
    formErrors: { types: rowErrors },
    typeData: cleanedData,
  };
}