import React from 'react';

export const BatteryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5.625v12.75a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18.375V5.625a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0115 5.625z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h6" />
    </svg>
);
