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

    if (isLoading && !weatherData) {
        return (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <SpinnerIcon className="w-5 h-5 text-brand" />
            </div>
        );
    }

    if (!weatherData) return null;

    const { current } = weatherData;
    const condition = mapWmoCodeToIcon(current.weatherCode);

    return (
        <div className="relative">
            <button
                onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
                className={`flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 pr-4 transition-all shadow-glass ${isOpen ? 'bg-white/10' : ''}`}
            >
                <div className="p-1.5 bg-brand/20 rounded-xl">
                    <WeatherIcon condition={condition} className="w-6 h-6" />
                </div>
                <div className="text-left leading-none">
                    <p className="text-lg font-black text-white">{Math.round(current.temperature)}°</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cielo {condition}</p>
                </div>
                <ChevronDownIcon className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 p-4 z-20 animate-ios">
                    <WeatherTimeline hourlyData={weatherData.hourly} />
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>Humedad: {current.precipitationProbability}%</span>
                        <button onClick={onRefresh} className="text-brand hover:underline">Refrescar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompactWeatherWidget;