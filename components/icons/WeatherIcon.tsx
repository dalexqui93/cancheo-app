import React from 'react';
import type { WeatherCondition } from '../../types';

interface WeatherIconProps extends React.SVGProps<SVGSVGElement> {
    condition: WeatherCondition;
}

const Sunny: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 64 64"><path d="M41 32c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" fill="#fcc44d"/><path d="M32 0a3 3 0 013 3v5a3 3 0 01-6 0V3a3 3 0 013-3zM32 56a3 3 0 01-3 3v5a3 3 0 016 0v-5a3 3 0 01-3-3zM8 32a3 3 0 01-3-3H0a3 3 0 010-6h5a3 3 0 013 3v3zm48 0a3 3 0 01-3-3v-3a3 3 0 016 0v3a3 3 0 01-3 3zM15.03 15.03a3 3 0 01-4.24 0l-3.54-3.54a3 3 0 014.24-4.24l3.54 3.54a3 3 0 010 4.24zM48.97 48.97a3 3 0 01-4.24 0l-3.54-3.54a3 3 0 014.24-4.24l3.54 3.54a3 3 0 010 4.24zM15.03 48.97a3 3 0 010-4.24l-3.54-3.54a3 3 0 01-4.24 4.24l3.54 3.54a3 3 0 014.24 0zM48.97 15.03a3 3 0 010-4.24l3.54-3.54a3 3 0 014.24 4.24l-3.54 3.54a3 3 0 01-4.24 0z" fill="#fcc44d"/></svg>
);

const Cloudy: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 64 64"><path d="M51.72 23.47a15 15 0 00-28.87-1.89 12 12 0 00-1.25 23.89H50.5a12 12 0 001.22-23.9z" fill="#cdd3d5"/></svg>
);

const PartlyCloudy: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 64 64"><path d="M41 32c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" fill="#fcc44d"/><path d="M32 0a3 3 0 013 3v5a3 3 0 01-6 0V3a3 3 0 013-3zM8 32a3 3 0 01-3-3H0a3 3 0 010-6h5a3 3 0 013 3v3zM15.03 15.03a3 3 0 01-4.24 0l-3.54-3.54a3 3 0 014.24-4.24l3.54 3.54a3 3 0 010 4.24z" fill="#fcc44d"/><path d="M55.72 35.47a15 15 0 00-28.87-1.89 12 12 0 00-1.25 23.89H54.5a12 12 0 001.22-23.9z" fill="#cdd3d5"/></svg>
);

const Rainy: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 64 64"><path d="M51.72 23.47a15 15 0 00-28.87-1.89 12 12 0 00-1.25 23.89H50.5a12 12 0 001.22-23.9z" fill="#cdd3d5"/><path d="M22 47a3 3 0 01-3 3v5a3 3 0 016 0v-5a3 3 0 01-3-3zM32 47a3 3 0 01-3 3v5a3 3 0 016 0v-5a3 3 0 01-3-3zM42 47a3 3 0 01-3 3v5a3 3 0 016 0v-5a3 3 0 01-3-3z" fill="#88c0e2"/></svg>
);

const Stormy: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 64 64"><path d="M51.72 23.47a15 15 0 00-28.87-1.89 12 12 0 00-1.25 23.89H50.5a12 12 0 001.22-23.9z" fill="#cdd3d5"/><path d="M30.45 42.12l-5.63 7.89h18.37l-6.86-9.61-5.88 1.72z" fill="#fcc44d"/></svg>
);

const Foggy: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 64 64"><path d="M51.72 23.47a15 15 0 00-28.87-1.89 12 12 0 00-1.25 23.89H50.5a12 12 0 001.22-23.9z" fill="#cdd3d5"/><path d="M0 50h64v4H0zM0 58h64v4H0z" fill="#cdd3d5" opacity=".7"/></svg>
);


const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, ...props }) => {
    switch(condition) {
        case 'sunny': return <Sunny {...props} />;
        case 'partly-cloudy': return <PartlyCloudy {...props} />;
        case 'cloudy': return <Cloudy {...props} />;
        case 'rainy': return <Rainy {...props} />;
        case 'stormy': return <Stormy {...props} />;
        case 'foggy': return <Foggy {...props} />;
        default: return <Cloudy {...props} />; // Fallback icon
    }
};

export default WeatherIcon;