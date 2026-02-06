import React from 'react';
import ActionIcon  from './action-icon'; // Adjust import based on your project

interface TagProps {
  label: string | React.ReactNode;
  onRemove: () => void;
  // Optional: customize background, size, etc.
  className?: string;
  locked?: boolean;
}

const Tag: React.FC<TagProps> = ({ label, onRemove, locked, className='' }) => {
  return (
    <span
      className={`flex w-fit items-center gap-2 rounded-xl ${locked === true ? "bg-gray-200 text-gray-600" : "bg-primary text-white"} px-2 py-1 text-sm  ${className}`}
    >
      {label}
      {
        locked === true ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        ):
        (
          <ActionIcon
            name="close"
            onClick={onRemove}
            className="hover:bg-white/20"
          />
        )
      }

    </span>
  );
};

export default Tag;