import React from 'react';

export const RainDropIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12.75a.75.75 0 00-1.5 0v2.25a.75.75 0 001.5 0V12.75zM12 8.25a.75.75 0 000 1.5.75.75 0 000-1.5z" />
    </svg>
);