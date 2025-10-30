import React from 'react';

const FieldCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-none dark:border dark:border-gray-700 overflow-hidden">
            <div className="aspect-video w-full bg-gray-200 dark:bg-gray-700 shimmer-bg"></div>
            <div className="p-4">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 shimmer-bg"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4 shimmer-bg"></div>
                <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 shimmer-bg"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4 shimmer-bg"></div>
                </div>
            </div>
        </div>
    );
};

export default FieldCardSkeleton;