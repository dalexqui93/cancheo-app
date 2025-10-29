import React from 'react';

export const ShoeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.78 14.24-2.52 1.01C18.15 15.68 17 15.22 17 14V9c0-.55.45-1 1-1h2c.55 0 1 .45 1 1v4c0 .55-.45 1-1 1h-1.22z"/>
        <path d="M17 9V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-4"/>
        <path d="M8 18v-2.5c0-.83.67-1.5 1.5-1.5h1c.83 0 1.5.67 1.5 1.5V18"/>
        <path d="M10 14h1"/>
    </svg>
);
