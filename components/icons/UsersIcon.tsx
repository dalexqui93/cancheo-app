import React from 'react';

interface UsersIconProps extends React.SVGProps<SVGSVGElement> {
    isActive?: boolean;
}

export const UsersIcon: React.FC<UsersIconProps> = ({ isActive = false, ...props }) => {
    const commonProps = {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        ...props,
    };

    if (isActive) {
        return (
            <svg {...commonProps} fill="currentColor">
              <path fillRule="evenodd" d="M11.025 2.268c.284-.135.616-.135.9 0l7.5 3.5c.284.136.475.43.475.75 v8.964c0 .32-.19.614-.475.75l-7.5 3.5c-.284.135-.616.135-.9 0l-7.5-3.5a.81.81 0 01-.475-.75V6.518c0-.32.19-.614.475-.75l7.5-3.5zM8.25 9a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm0 3a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
            </svg>
        );
    }
    return (
        <svg {...commonProps} fill="none" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.57-.063 1.14-.094 1.72-.094a9.094 9.094 0 015.836 1.836m-6.714-7.85a9.094 9.094 0 016.714 0m-11.218 0a9.094 9.094 0 0111.218 0m-1.504 5.033c.57-.063 1.14-.094 1.72-.094a9.094 9.094 0 015.836 1.836M3.75 18.72a9.094 9.094 0 013.741-.479 3 3 0 01-4.682-2.72" />
        </svg>
    );
};
