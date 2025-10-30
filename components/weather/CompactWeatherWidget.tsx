import React, { useState } from 'react';
import type { WeatherData } from '../../types';
import { getWeatherDescription, mapWmoCodeToIcon } from '../../utils/weatherUtils';
import WeatherTimeline from './WeatherTimeline';
import WeatherIcon from '../icons/WeatherIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import AnimatedWeatherBackground from './AnimatedWeatherBackground';

interface CompactWeatherWidgetProps {
    weatherData: WeatherData | null;
    isLoading: boolean;
}

const CompactWeatherWidgetSkeleton: React.FC = () => (
    <div className="w-full max-w-sm mx-auto h-14 bg-black/20 backdrop-blur-sm rounded-full animate-pulse border border-white/20"></div>
);


const CompactWeatherWidget: React.FC<CompactWeatherWidgetProps> = ({ weatherData, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (isLoading) {
        return <CompactWeatherWidgetSkeleton />;
    }

    if (!weatherData) {
        return null; // Don't show anything if weather data fails
    }

    const { current } = weatherData;
    const weatherCondition = mapWmoCodeToIcon(current.weatherCode);
    const weatherDescription = getWeatherDescription(current.weatherCode);

    return (
        <div 
            className={`relative overflow-hidden w-full max-w-sm mx-auto backdrop-blur-md border border-white/20 transition-all duration-500 ease-in-out cursor-pointer ${isOpen ? 'rounded-2xl' : 'rounded-full'}`}
            onClick={() => setIsOpen(!isOpen)}
        >
            <AnimatedWeatherBackground condition={weatherCondition} />
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>

            <div className="relative z-10 flex items-center p-2">
                <div className="flex-shrink-0">
                    <WeatherIcon 
                        condition={weatherCondition} 
                        className={`w-10 h-10 ${weatherCondition === 'sunny' ? 'animate-spin-slow' : ''}`}
                    />
                </div>
                <div className="flex-grow mx-3 text-left">
                    <p className="font-bold text-lg leading-tight">{Math.round(current.temperature)}°</p>
                    <p className="text-xs opacity-80 leading-tight">{weatherDescription}</p>
                </div>
                <div className="flex-shrink-0 p-2">
                    <ChevronDownIcon className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="border-t border-white/20">
                         <WeatherTimeline hourlyData={weatherData.hourly} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompactWeatherWidget;