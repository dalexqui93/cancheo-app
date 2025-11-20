
import React from 'react';

export const SwordsAndBallIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
        {/* Crossed Swords */}
        <path d="M4.5 20.5L16.5 8.5" />
        <path d="M2 22L4 20" />
        <path d="M16.5 8.5L19.5 5.5" />
        <path d="M6 16L8 18" />
        
        <path d="M19.5 20.5L7.5 8.5" />
        <path d="M22 22L20 20" />
        <path d="M7.5 8.5L4.5 5.5" />
        <path d="M18 16L16 18" />

        {/* Soccer Ball */}
        <circle cx="12" cy="5" r="3" />
        <path d="M12 5l-1.2 1.2" />
        <path d="M12 5l1.2 1.2" />
        <path d="M12 2v3" />
    </svg>
);
