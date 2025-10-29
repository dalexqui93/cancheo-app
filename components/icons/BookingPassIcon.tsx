
import React from 'react';

interface BookingPassIconProps extends React.SVGProps<SVGSVGElement> {
    isActive?: boolean;
}

export const BookingPassIcon: React.FC<BookingPassIconProps> = ({ isActive = false, ...props }) => {
    const commonProps = {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        ...props,
    };

    if (isActive) {
        return (
            <svg {...commonProps} fill="currentColor">
                <path d="M4 4.5A2.5 2.5 0 016.5 2h11A2.5 2.5 0 0120 4.5v15a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 19.5v-15zM8.5 8a1 1 0 000 2h7a1 1 0 000-2h-7zm0 4a1 1 0 000 2h7a1 1 0 000-2h-7z" />
            </svg>
        );
    }
    return (
        <svg {...commonProps} fill="none" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5h-15A2.5 2.5 0 002 7v10a2.5 2.5 0 002.5 2.5h15A2.5 2.5 0 0022 17V7a2.5 2.5 0 00-2.5-2.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6m-6 4h6" />
        </svg>
    );
};
