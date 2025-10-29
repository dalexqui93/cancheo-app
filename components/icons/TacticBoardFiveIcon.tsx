import React from 'react';

export const TacticBoardFiveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="12" cy="12" r="2.5"></circle>
        <circle cx="8" cy="8" r="1.5"></circle>
        <circle cx="16" cy="8" r="1.5"></circle>
        <circle cx="8" cy="16" r="1.5"></circle>
        <circle cx="16" cy="16" r="1.5"></circle>
    </svg>
);
