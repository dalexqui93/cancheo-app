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
    onRefresh: () => void;
}

const CompactWeatherWidget: React.FC<CompactWeatherWidgetProps> = ({ weatherData, isLoading, onRefresh }) => {
    const [isOpen, setIsOpen] = useState(false);

    const bestTimes = useMemo(() => {
        if (!weatherData) return [];
        return findBestPlayingTimes(weatherData.hourly);
    }, [weatherData]);

    if (isLoading && !weatherData) { // Muestra el spinner solo en la carga inicial
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

    const { current, locationName } = weatherData;
    const condition = mapWmoCodeToIcon(current.weatherCode);

    return (
        <div className="w-full max-w-sm mx-auto bg-black/20 backdrop-blur-md rounded-xl shadow-lg text-white transition-all duration-300 overflow-hidden relative border border-white/20">
            <div className="absolute inset-0">
                <AnimatedWeatherBackground condition={condition} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            
             <div className="absolute top-2 right-2 z-20">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isLoading) {
                            onRefresh();
                        }
                    }}
                    disabled={isLoading}
                    className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-colors disabled:cursor-wait"
                    title="Actualizar clima"
                >
                    <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691L7.985 5.989m11.667 0l-3.181 3.183m0 0l-3.181-3.183" />
                    </svg>
                </button>
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
                <div className="text-right flex-grow min-w-0">
                    {locationName && <p className="font-bold text-sm truncate">{locationName}</p>}
                    <p className={`font-semibold capitalize text-sm ${locationName ? 'opacity-80' : ''}`}>{condition === 'partly-cloudy' ? 'Parc. Nublado' : condition}</p>
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