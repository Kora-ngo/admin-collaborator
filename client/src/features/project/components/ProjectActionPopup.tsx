// src/components/widgets/project-action-popup.tsx

"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../../../components/widgets/button";

interface ActionOption {
  value: string;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface ProjectActionPopupProps {
  open: boolean;
  onClose: () => void;
  projectStatus: string;
  projectName: string;
  onConfirm: (action: string) => void;
}

export default function ProjectActionPopup({
  open,
  onClose,
  projectStatus,
  projectName,
  onConfirm,
}: ProjectActionPopupProps) {
  const [render, setRender] = useState(open);
  const [isVisible, setIsVisible] = useState(open);
  const [selectedAction, setSelectedAction] = useState<string>("");

  // Handle open/close with smooth animation (same as your Popup)
  useEffect(() => {
    if (open) {
      setRender(true);
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      const timeout = setTimeout(() => setRender(false), 220);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedAction("");
        onClose();
      }
    };
    if (render) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [render, onClose]);

  // Define available actions based on current project status
  const getActionsForStatus = (): ActionOption[] => {
    switch (projectStatus) {
      case "pending":
        return [
          {
            value: "delete",
            label: "Delete Project",
            description: "Remove this project permanently. This action cannot be undone.",
            color: "text-red-600",
            bgColor: "bg-red-50",
            borderColor: "border-red-600",
          },
        ];

      case "ongoing":
        return [
          {
            value: "done",
            label: "Mark as Done",
            description: "Complete this project successfully. All goals achieved.",
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-600",
          },
          {
            value: "suspended",
            label: "Suspend Project",
            description: "Temporarily pause this project. Can be resumed later.",
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-600",
          },
        ];

      case "overdue":
        return [
          {
            value: "done",
            label: "Mark as Done",
            description: "Complete this overdue project. Better late than never.",
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-600",
          },
          {
            value: "suspended",
            label: "Suspend Project",
            description: "Pause this overdue project for review or restructuring.",
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-600",
          },
        ];


        case "suspended":
        return [
          {
            value: "true",
            label: "Resume the project",
            description: "Get back to where you ended.",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-600",
          },
        ];


      default:
        return [];
    }
  };

  const actions = getActionsForStatus();

  const handleConfirm = () => {
    if (selectedAction) {
      onConfirm(selectedAction);
      setSelectedAction("");
    }
  };

  const handleCancel = () => {
    setSelectedAction("");
    onClose();
  };

  if (!render) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 ${
          isVisible ? "animate-backdrop-in" : "animate-backdrop-out"
        }`}
        onClick={handleCancel}
      />

      {/* Modal Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-50 w-full max-w-md rounded-lg bg-white shadow-xl mx-4 ${
          isVisible ? "animate-popup-in" : "animate-popup-out"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Project Actions</h3>
          <p className="mt-1 text-sm text-gray-600">
            Select an action for{" "}
            <span className="font-semibold">{projectName}</span>
          </p>
        </div>

        {/* Action Options */}
        <div className="px-6 py-4 space-y-3">
          {actions.map((action) => (
            <label
              key={action.value}
              className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedAction === action.value
                  ? `${action.borderColor} ${action.bgColor}`
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="project-action"
                value={action.value}
                checked={selectedAction === action.value}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className={`font-bold ${action.color} mb-1`}>
                  {action.label}
                </div>
                <div className="text-sm text-gray-600">{action.description}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 bg-gray-50 px-6 py-3 rounded-b-lg">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedAction}
            className={!selectedAction ? "opacity-50 cursor-not-allowed" : ""}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}