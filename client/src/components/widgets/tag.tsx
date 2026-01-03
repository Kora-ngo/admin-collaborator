import React from 'react';
import ActionIcon  from './action-icon'; // Adjust import based on your project

interface TagProps {
  label: string;
  onRemove: () => void;
  // Optional: customize background, size, etc.
  className?: string;
}

const Tag: React.FC<TagProps> = ({ label, onRemove, className = '' }) => {
  return (
    <span
      className={`flex w-fit items-center gap-2 rounded-xl bg-primary px-2 py-1 text-sm text-white ${className}`}
    >
      {label}
      <ActionIcon
        name="close"
        onClick={onRemove}
        className="hover:bg-white/20"
      />
    </span>
  );
};

export default Tag;