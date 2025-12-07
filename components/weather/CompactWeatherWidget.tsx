
import React, { useState, useMemo } from 'react';
import type { WeatherData } from '../../types';
import WeatherIcon from '../icons/WeatherIcon';
import { mapWmoCodeToIcon, findBestPlayingTimes } from '../../utils/weatherUtils';
import { SpinnerIcon } from '../icons/SpinnerIcon';
import WeatherTimeline from './WeatherTimeline';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

interface CompactWeatherWidgetProps {
    weatherData: WeatherData | null;
    isLoading: boolean;
    onRefresh: () => void;
}

const CompactWeatherWidget: React.FC<CompactWeatherWidgetProps> = ({ weatherData, isLoading, onRefresh }) => {
    const [isOpen, setIsOpen] = useState(false);

    const bestTimes = useMemo(() => {
        if (!weatherData) return [];
        return findBestPlayingTimes(weatherData.hourly);
    }, [weatherData]);

    if (isLoading && !weatherData) {
        return (
            <div className="w-full max-w-xs mx-auto mt-4 p-2 flex justify-center">
                <SpinnerIcon className="w-5 h-5 text-white/50" />
            </div>
        );
    }

    if (!weatherData) return null;

    const { current, locationName } = weatherData;
    const condition = mapWmoCodeToIcon(current.weatherCode);

    return (
        <div className="w-full max-w-[320px] mx-auto mt-6 transition-all duration-300">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(!isOpen);
                }}
                className={`group w-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 rounded-3xl p-5 text-white transition-all duration-300 shadow-sm ${isOpen ? 'bg-white/20' : ''}`}
                aria-expanded={isOpen}
                type="button"
            >
                <div className="flex items-center justify-between w-full">
                    {/* Left: Icon & Temp */}
                    <div className="flex items-center gap-4">
                        <WeatherIcon condition={condition} className="w-12 h-12 drop-shadow-md filter brightness-110" />
                        <div className="text-left flex flex-col justify-center">
                            <div className="text-4xl font-light leading-none tracking-tighter">
                                {Math.round(current.temperature)}°
                            </div>
                            <div className="text-xs font-medium text-white/80 capitalize mt-1 tracking-wide">
                                {condition.replace('-', ' ')}
                            </div>
                        </div>
                    </div>

                    {/* Right: Location & Details */}
                    <div className="text-right pl-2">
                        {locationName && (
                            <div className="text-sm font-bold tracking-tight truncate max-w-[110px] leading-tight">
                                {locationName}
                            </div>
                        )}
                        <div className="text-[11px] font-medium text-white/70 mt-1 flex justify-end gap-2">
                            <span>H:{Math.round(current.temperature + 4)}°</span>
                            <span>L:{Math.round(current.temperature - 3)}°</span>
                        </div>
                    </div>
                </div>

                {/* Expanded Content */}
                <div 
                    className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isOpen ? 'grid-rows-[1fr] opacity-100 mt-5 pt-4 border-t border-white/10' : 'grid-rows-[0fr] opacity-0'
                    }`}
                >
                    <div className="overflow-hidden">
                        {/* Best Times Pill */}
                        {bestTimes.length > 0 && (
                            <div className="mb-5 text-left">
                                <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider mb-2 block">Mejor hora para jugar</span>
                                <div className="flex flex-wrap gap-2">
                                    {bestTimes.slice(0, 3).map((period, index) => (
                                        <span key={index} className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-100 text-xs font-bold py-1 px-3 rounded-full">
                                            {period}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <WeatherTimeline hourlyData={weatherData.hourly} />
                        
                        <div className="mt-5 flex items-center justify-between text-[10px] text-white/50 uppercase font-bold tracking-widest">
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1">💧 {current.precipitationProbability}%</span>
                                <span className="flex items-center gap-1">💨 {Math.round(current.windSpeed)} km/h</span>
                            </div>
                            <div 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRefresh();
                                }}
                                className="cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                            >
                                <span>Actualizar</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Micro chevron */}
                <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-40 group-hover:opacity-100'}`}>
                    <ChevronDownIcon className="w-3 h-3" />
                </div>
            </button>
        </div>
    );
};

export default CompactWeatherWidget;
