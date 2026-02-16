import { useEffect, useState } from "react";
import { useAssistanceStore } from "../../assistance/store/assistanceStore";

export const useAssitanceSelect = () => {

  const {data, getData} = useAssistanceStore();

      useEffect(() => {
          getData(1, "", "all");
      }, [getData])
  

  // Selected assistance members (initially empty or with defaults)
  const [selectedAssistance, setSelectedAssistance] = useState<typeof data>([]);
  // Or with initial: [allAssistance[0]]

  const handleAddAssistance = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;

    const person = data.find(p => p.id === Number(value));
    if (person && !selectedAssistance.some(s => s.id === person.id)) {
      setSelectedAssistance([...selectedAssistance, person]);
    }

    // Reset select
    e.target.value = '';
  };

  const handleRemoveAssistance = (id: number) => {
    setSelectedAssistance(selectedAssistance.filter(p => p.id !== id));
  };

  const handleClearAllAssistance = () => {
    setSelectedAssistance([]);
  };

  // Available options: exclude already selected
  const availableAssisOptions = data.filter(
    p => !selectedAssistance.some(s => s.id === p.id)
  );

  return {
    selectedAssistance,
    availableAssisOptions,

    setSelectedAssistance,

    handleAddAssistance,
    handleRemoveAssistance,
    handleClearAllAssistance,
  };
};