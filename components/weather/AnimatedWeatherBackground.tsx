import React from 'react';
import type { WeatherCondition } from '../../types';

interface AnimatedWeatherBackgroundProps {
    condition: WeatherCondition;
}

const Raindrop: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="absolute w-px h-12 bg-gradient-to-b from-transparent to-white/50" style={style}></div>
);

const Cloud: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="absolute w-32 h-12 bg-white/20 rounded-full filter blur-md" style={style}></div>
);

const AnimatedWeatherBackground: React.FC<AnimatedWeatherBackgroundProps> = ({ condition }) => {
    const renderWeatherEffect = () => {
        switch (condition) {
            case 'sunny':
                return (
                    <div 
                        className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full"
                        style={{ animation: 'sun-glow 8s infinite ease-in-out' }}
                    ></div>
                );
            case 'rainy':
            case 'stormy':
                return Array.from({ length: 25 }).map((_, i) => (
                    <Raindrop key={i} style={{
                        left: `${Math.random() * 100}%`,
                        animation: `rain ${0.5 + Math.random() * 0.5}s linear ${Math.random() * 2}s infinite`,
                    }} />
                ));
            case 'cloudy':
            case 'partly-cloudy':
            case 'foggy':
                 return <>
                    <Cloud style={{ top: '10%', animation: 'cloud-move 25s linear infinite alternate' }} />
                    <Cloud style={{ top: '30%', left: '50%', animation: 'cloud-move 35s linear infinite alternate-reverse' }} />
                </>;
            default:
                return null;
        }
    };

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {renderWeatherEffect()}
        </div>
    );
};

export default AnimatedWeatherBackground;