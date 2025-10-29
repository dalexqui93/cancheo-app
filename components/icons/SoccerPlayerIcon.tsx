import React from 'react';

export const SoccerPlayerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="4" r="2" />
        <path d="M12 20a4 4 0 0 0-8 0" />
        <path d="M10.3 7.8L7 11" />
        <path d="M14 20l3-5.5" />
        <path d="M11 13l5-1.5" />
        <circle cx="19" cy="10" r="2" />
    </svg>
);