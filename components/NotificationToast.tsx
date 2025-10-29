import React, { useEffect, useState } from 'react';
import type { Notification } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { XIcon } from './icons/XIcon';

interface NotificationToastProps {
    notification: Notification;
    onDismiss: (id: number) => void;
}

const ICONS = {
    success: <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />,
    info: <InformationCircleIcon className="h-6 w-6 text-blue-500" aria-hidden="true" />,
    error: <InformationCircleIcon className="h-6 w-6 text-red-500" aria-hidden="true" />, // Placeholder, can create specific error icon
};

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
    const { id, type, title, message } = notification;
    const [isShowing, setIsShowing] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        setIsShowing(true);

        // Set timer to dismiss
        const timer = setTimeout(() => {
            handleDismiss();
        }, 5000);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    const handleDismiss = () => {
        setIsShowing(false);
        // Allow time for exit animation before removing from DOM
        setTimeout(() => onDismiss(id), 300);
    };

    return (
        <div
            className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white/10 transition-all duration-300 ease-in-out
                ${isShowing ? 'transform-gpu opacity-100 translate-x-0' : 'transform-gpu opacity-0 translate-x-full'}`}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {ICONS[type]}
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
                    </div>
                    <div className="ml-4 flex flex-shrink-0">
                        <button
                            type="button"
                            className="inline-flex rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                            onClick={handleDismiss}
                        >
                            <span className="sr-only">Close</span>
                            <XIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationToast;