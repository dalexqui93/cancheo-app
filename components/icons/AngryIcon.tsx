import React from 'react';

export const AngryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 14.25a7.5 7.5 0 00-7.5 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9.75L9.75 8.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75L8.25 8.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L15.75 8.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9.75L14.25 8.25" />
    </svg>
);
