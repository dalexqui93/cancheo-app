import React from 'react';

export const RunningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM15.75 9.75l-3.75-3.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75l-4.5-4.5m4.5 4.5l-3.75 3.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75l-3.75-3.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75l-3.75 3.75" />
    </svg>
);
