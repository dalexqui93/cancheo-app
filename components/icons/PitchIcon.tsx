import React from 'react';

export const PitchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125A2.25 2.25 0 014.5 4.875h15A2.25 2.25 0 0121.75 7.125v9.75A2.25 2.25 0 0119.5 19.125h-15A2.25 2.25 0 012.25 16.875V7.125z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.875v14.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
    </svg>
);