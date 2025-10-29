import React from 'react';
import type { Notification } from '../types';
import NotificationToast from './NotificationToast';

interface NotificationContainerProps {
    notifications: Notification[];
    onDismiss: (id: number) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onDismiss }) => {
    return (
        <div
            aria-live="assertive"
            className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-[100]"
        >
            <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                {notifications.map((notification) => (
                    <NotificationToast
                        key={notification.id}
                        notification={notification}
                        onDismiss={onDismiss}
                    />
                ))}
            </div>
        </div>
    );
};

export default NotificationContainer;