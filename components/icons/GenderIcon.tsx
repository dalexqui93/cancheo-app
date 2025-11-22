
import React from 'react';

export const GenderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 18a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        <path d="M9 18v3" />
        <path d="M6 20h6" />
        <path d="M15 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        <path d="M17.8 6.2L21 3" />
        <path d="M21 3h-3" />
        <path d="M21 3v3" />
    </svg>
);
