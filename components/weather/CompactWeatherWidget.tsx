import React, { useState, useMemo } from 'react';
import type { WeatherData } from '../../types';
import WeatherIcon from '../icons/WeatherIcon';
import { mapWmoCodeToIcon, findBestPlayingTimes } from '../../utils/weatherUtils';
import { SpinnerIcon } from '../icons/SpinnerIcon';
import WeatherTimeline from './WeatherTimeline';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import AnimatedWeatherBackground from './AnimatedWeatherBackground';

interface CompactWeatherWidgetProps {
    weatherData: WeatherData | null;
    isLoading: boolean;
}

const CompactWeatherWidget: React.FC<CompactWeatherWidgetProps> = ({ weatherData, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);

    const bestTimes = useMemo(() => {
        if (!weatherData) return [];
        return findBestPlayingTimes(weatherData.hourly);
    }, [weatherData]);

    if (isLoading) {
        return (
            <div className="w-full max-w-sm mx-auto bg-black/20 backdrop-blur-md rounded-xl p-3 text-white/80 text-sm flex items-center justify-center gap-2">
                <SpinnerIcon className="w-5 h-5" />
                <span>Cargando clima...</span>
            </div>
        );
    }

    if (!weatherData) {
        return (
            <div className="w-full max-w-sm mx-auto bg-black/20 backdrop-blur-md rounded-xl p-3 text-white/80 text-sm text-center">
                No se pudo cargar el clima.
            </div>
        );
    }

    const { current } = weatherData;
    const condition = mapWmoCodeToIcon(current.weatherCode);

    return (
        <div className="w-full max-w-sm mx-auto bg-black/20 backdrop-blur-md rounded-xl shadow-lg text-white transition-all duration-300 overflow-hidden relative border border-white/20">
            <div className="absolute inset-0">
                <AnimatedWeatherBackground condition={condition} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                className="relative flex items-center justify-between w-full p-3 text-left z-10"
            >
                <div className="flex items-center gap-3">
                    <WeatherIcon condition={condition} className={`w-10 h-10 ${condition === 'sunny' ? 'animate-spin-slow' : ''}`} />
                    <div>
                        <p className="text-2xl font-bold">{Math.round(current.temperature)}°C</p>
                        <p className="text-xs opacity-80">Sensación {Math.round(current.apparentTemperature)}°</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-semibold capitalize">{condition === 'partly-cloudy' ? 'Parcialmente Nublado' : condition}</p>
                    <div className="flex items-center justify-end gap-2 text-xs opacity-80">
                         <span>💧 {current.precipitationProbability}%</span>
                         <span>💨 {Math.round(current.windSpeed)} km/h</span>
                    </div>
                </div>
                <ChevronDownIcon className={`w-6 h-6 ml-2 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`relative grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'} z-10`}>
                <div className="overflow-hidden">
                    <div className="p-4 border-t border-white/20">
                         <h4 className="font-bold text-sm mb-2">Mejores Horarios para Jugar:</h4>
                        {bestTimes.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {bestTimes.map((period, index) => (
                                    <span key={index} className="bg-green-500/80 text-white text-xs font-bold py-1 px-2 rounded-full">
                                        {period}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-white/80">No se encontraron horarios favorables en las próximas 24h.</p>
                        )}
                        <WeatherTimeline hourlyData={weatherData.hourly} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompactWeatherWidget;