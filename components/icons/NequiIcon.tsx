import React from 'react';

export const NequiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="nequiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#9B30FF', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#FF00A5', stopOpacity: 1}} />
            </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#nequiGradient)" />
        <path d="M30 70 V 30 H 45 L 60 50 L 70 30 V 70" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
