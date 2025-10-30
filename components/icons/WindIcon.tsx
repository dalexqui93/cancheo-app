import React from 'react';

export const WindIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343m11.314 11.314a8 8 0 00-11.314-11.314" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12h.01" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 12H12m0 0h8.25" />
    </svg>
);