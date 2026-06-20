import React from "react";

type BadgeColor =
  | "green"
  | "red"
  | "yellow"
  | "blue"
  | "gray"
  | "accent"
  | "purple"
  | "orange";

interface StatusBadgeProps {
  color?: BadgeColor;
  text: any;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ color = "gray", text }) => {
  const getColorClasses = (color: BadgeColor) => {
    switch (color) {
      case "green":
        return "bg-green-100 text-green-700";
      case "red":
        return "bg-red-100 text-red-700";
      case "yellow":
        return "bg-yellow-100 text-yellow-700";
      case "blue":
        return "bg-blue-100 text-blue-700";
      case "gray":
        return "bg-gray-100 text-gray-700";
      case "accent":
        return "bg-accent/20 text-accent";
      case "purple":
        return "bg-purple-100 text-purple-700";
      case "orange":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded ${getColorClasses(
        color
      )}`}
    >
      {text}
    </span>
  );
};

export default StatusBadge;
