// components/SessionExpiredModal.tsx

import { useEffect, useState } from 'react';
import Modal from '../../components/widgets/modal';
import { Button } from '../../components/widgets/button';
import Popup from '../../components/widgets/popup';


interface SessionExpiredModalProps {
    open: boolean;
    onClose: () => void;
}

const SessionExpiredModal = ({ open, onClose }: SessionExpiredModalProps) => {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (!open) {
            setCountdown(5);
            return;
        }

        // Auto-redirect after countdown
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [open, onClose]);

    return (
        <Popup
            open={open}
            onClose={onClose}
            title="Session Expired"
            children={
                <div className="space-y-4">
                    <div className="flex items-center justify-center">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                strokeWidth={1.5} 
                                stroke="currentColor" 
                                className="w-8 h-8 text-amber-600"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" 
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Your session has expired
                        </h3>
                        <p className="text-sm text-gray-600">
                            This account is currently open in another tab or window.
                            You can only be logged in from one location at a time.
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800 text-center">
                            Redirecting to login in <strong>{countdown}</strong> seconds...
                        </p>
                    </div>

                    <div className="flex justify-center pt-2">
                        <Button 
                            onClick={onClose}
                            className="w-full sm:w-auto"
                        >
                            Go to Login Now
                        </Button>
                    </div>
                </div>
            }
        />
    );
};

export default SessionExpiredModal;