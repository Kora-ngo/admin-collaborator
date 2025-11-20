import React, { useEffect, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  title: string;
  message: string;
  variant?: ToastVariant;
  isOpen: boolean;
  onClose: () => void;
  autoClose?: number; // Auto-close after X milliseconds
  className?: string;
}

const variantStyles: Record<ToastVariant, { iconColor: string; iconPath: string }> = {
  success: {
    iconColor: 'text-green-500',
    iconPath:
      'M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z',
  },
  error: {
    iconColor: 'text-red-500',
    iconPath:
      'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12 15.75a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-.75.75Zm0-7.5a.75.75 0 0 1-.75-.75V6a.75.75 0 0 1 1.5 0v1.5a.75.75 0 0 1-.75.75Z',
  },
  warning: {
    iconColor: 'text-yellow-500',
    iconPath:
      'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12 15.75a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-.75.75Zm0-7.5a.75.75 0 0 1-.75-.75V6a.75.75 0 0 1 1.5 0v1.5a.75.75 0 0 1-.75.75Z',
  },
  info: {
    iconColor: 'text-blue-500',
    iconPath:
      'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12 15.75a.75.75 0 0 1-.75-.75v-3a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-.75.75Zm0-6.75a.75.75 0 0 1-.75-.75V6a.75.75 0 0 1 1.5 0v2.25a.75.75 0 0 1-.75.75Z',
  },
};

const Toast: React.FC<ToastProps> = ({
  title,
  message,
  variant = 'success',
  isOpen,
  onClose,
  autoClose,
  className = '',
}) => {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    setVisible(isOpen);
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, onClose]);

  return (
    <div
      role="alert"
      aria-hidden={!visible}
      className={`flex rounded-lg items-center fixed bottom-8 right-5 z-50 alert w-90 alert-vertica transition-all duration-500 ease-in-out shadow-lg bg-white border border-gray-200 px-4 py-5 space-x-4 flex-col sm:flex-row ${className} ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`size-8 sm:size-10 ${variantStyles[variant].iconColor}`}
        >
          <path fillRule="evenodd" d={variantStyles[variant].iconPath} clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm sm:text-base">{title}</h3>
        <div className="text-xs sm:text-sm">{message}</div>
      </div>
      <div>
        <button
          aria-label="Close toast"
          onClick={() => {
            setVisible(false);
            onClose();
          }}
          className="text-gray-600 hover:text-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5 sm:size-6"
          >
            <path
              fillRule="evenodd"
              d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;