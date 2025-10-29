import React from 'react';
import type { CardBrand } from '../../types';

interface CardBrandIconProps extends React.SVGProps<SVGSVGElement> {
    brand: CardBrand;
}

const VisaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 121.3">
        <path fill="#1A1F71" d="M380.4,1.2c-2.3-1.6-5.5-1.9-8.4-1.2H10.8C5.2,1.3,1,5.8,1,11.5v98.3c0,5.7,4.2,10.2,9.8,11.5h361.2 c2.9,0.7,6.1,0.4,8.4-1.2c2.3-1.6,3.6-4.2,3.6-7.1V8.3C384,5.4,382.7,2.8,380.4,1.2z" />
        <path fill="#fff" d="M125.7,33.1l-16.2,55.9H94.4l-16.1-55.9h17.1l9.9,38.8l9.6-38.8H125.7z M193.3,33.1l-22.1,55.9h-15.3l22.1-55.9H193.3z M221.7,33.1h15.2v55.9h-15.2V33.1z M259,33.1h15.2v55.9H259V33.1z M301.7,33.1l11.4,55.9h-15.9l-2.6-13.4h-12.8l-2.6,13.4h-15.9l11.4-55.9H301.7z M292.1,66.5h8.8l-4.4-23.9L292.1,66.5z M23.9,33.1l16.2,55.9h15.1L39.1,33.1H23.9z" />
    </svg>
);

const MastercardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 30">
        <path d="M30,15.1a14.7,14.7,0,0,1-15,14.7A14.7,14.7,0,0,1,0,15.1,14.7,14.7,0,0,1,15,.4,14.7,14.7,0,0,1,30,15.1Z" style={{ fill: '#ff5f00' }} />
        <path d="M48,15.1a14.7,14.7,0,0,1-29.4,0,14.7,14.7,0,1,1,29.4,0Z" style={{ fill: '#eb001b' }} />
        <path d="M27.2,15.1a12.2,12.2,0,0,1-8.2,11.5,12.2,12.2,0,0,0,0-23A12.2,12.2,0,0,1,27.2,15.1Z" style={{ fill: '#f79e1b' }} />
    </svg>
);

const AmexIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 240">
        <rect width="384" height="240" rx="20" style={{ fill: '#006fcf' }} />
        <g style={{ fill: 'none', stroke: '#fff', strokeMiterlimit: 10, strokeWidth: '10px' }}>
            <rect x="52.8" y="50" width="278.5" height="140" />
            <line x1="52.8" y1="90" x2="331.3" y2="90" />
            <line x1="210" y1="120" x2="331.3" y2="120" />
            <line x1="210" y1="150" x2="331.3" y2="150" />
        </g>
    </svg>
);

const OtherIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
     <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);


export const CardBrandIcon: React.FC<CardBrandIconProps> = ({ brand, ...props }) => {
    switch (brand) {
        case 'Visa':
            return <VisaIcon {...props} />;
        case 'Mastercard':
            return <MastercardIcon {...props} />;
        case 'American Express':
            return <AmexIcon {...props} />;
        case 'Otro':
        default:
            return <OtherIcon {...props} className={`text-gray-500 dark:text-gray-400 ${props.className}`} />;
    }
};
