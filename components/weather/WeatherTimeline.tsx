import React from 'react';
import type { HourlyData } from '../../types';
import WeatherIcon from '../icons/WeatherIcon';
import { mapWmoCodeToIcon, getFavorability } from '../../utils/weatherUtils';

interface WeatherTimelineProps {
    hourlyData: HourlyData[];
}

const HourlyForecastItem: React.FC<{ hour: HourlyData }> = ({ hour }) => {
    const condition = mapWmoCodeToIcon(hour.weatherCode);
    const favorability = getFavorability(hour);

    const favorabilityColor = {
        'Favorable': 'bg-green-500',
        'Condicional': 'bg-yellow-500',
        'Desfavorable': 'bg-red-500',
    };

    return (
        <div className="flex flex-col items-center flex-shrink-0 w-20 text-center p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <p className="text-sm font-semibold">{hour.time.getHours()}:00</p>
            <WeatherIcon condition={condition} className="w-8 h-8 my-2" />
            <p className="text-xl font-bold">{Math.round(hour.temperature)}°</p>
            <div className="flex items-center gap-1 text-xs opacity-80 mt-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM12 18a.75.75 0 00.75-.75v-4.5a.75.75 0 00-1.5 0v4.5A.75.75 0 0012 18z"/></svg>
                <span>{hour.precipitationProbability}%</span>
            </div>
             <div 
                className={`w-2.5 h-2.5 rounded-full mt-2 ${favorabilityColor[favorability.status]}`} 
                title={`Condición: ${favorability.status} - ${favorability.reason}`}
            ></div>
        </div>
    );
};

const WeatherTimeline: React.FC<WeatherTimelineProps> = ({ hourlyData }) => {
    const now = new Date();
    // Filter to show from the current hour up to 24 hours ahead
    const relevantHours = hourlyData.filter(h => h.time >= now).slice(0, 24);

    return (
        <div className="mt-6 -mx-6 px-4">
            <div className="flex space-x-2 overflow-x-auto pb-3 scrollbar-hide">
                {relevantHours.map(hour => (
                    <HourlyForecastItem key={hour.time.toISOString()} hour={hour} />
                ))}
            </div>
        </div>
    );
};

export default WeatherTimeline;