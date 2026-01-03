import { useState } from "react";

export const useAssitanceSelect = () => {
  const allAssistance = [
    { id: 1, name: 'John K. (Field Assistant)' },
    { id: 2, name: 'Sarah L. (Data Assistant)' },
    { id: 3, name: 'Mike T. (Logistics)' },
    { id: 4, name: 'Nina R. (Field Assistant)' },
    { id: 5, name: 'Omar P. (Tech Support)' },
    { id: 6, name: 'Lisa M. (Coordinator)' },
    // Add more as needed
  ];

  // Selected assistance members (initially empty or with defaults)
  const [selectedAssistance, setSelectedAssistance] = useState<typeof allAssistance>([]);
  // Or with initial: [allAssistance[0]]

  const handleAddAssistance = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;

    const person = allAssistance.find(p => p.id === Number(value));
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
  const availableAssisOptions = allAssistance.filter(
    p => !selectedAssistance.some(s => s.id === p.id)
  );

  return {
    allAssistance,
    selectedAssistance,
    availableAssisOptions,

    handleAddAssistance,
    handleRemoveAssistance,
    handleClearAllAssistance,
  };
};