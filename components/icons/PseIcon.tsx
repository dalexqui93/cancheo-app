import React from 'react';

export const PseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="15" fill="#000" />
        <text x="50" y="55" fontFamily="Arial, sans-serif" fontSize="30" fill="white" textAnchor="middle" dy=".3em">
            <tspan fontWeight="bold">P</tspan><tspan>S</tspan><tspan fontWeight="bold">E</tspan>
        </text>
    </svg>
);
