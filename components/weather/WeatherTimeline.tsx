
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

    const favorabilityDot = {
        'Favorable': 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.6)]',
        'Condicional': 'bg-amber-400',
        'Desfavorable': 'bg-rose-500',
    };

    return (
        <div className="flex flex-col items-center flex-shrink-0 w-12 text-center snap-center">
            <p className="text-[10px] font-medium text-white/60 mb-1">{hour.time.getHours()}</p>
            <div className="relative mb-1">
                <WeatherIcon condition={condition} className="w-6 h-6 opacity-90" />
                <div className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${favorabilityDot[favorability.status]}`} />
            </div>
            <p className="text-sm font-bold text-white">{Math.round(hour.temperature)}°</p>
        </div>
    );
};

const WeatherTimeline: React.FC<WeatherTimelineProps> = ({ hourlyData }) => {
    const now = new Date();
    // Filter to show from the current hour up to 12 hours ahead for compactness
    const relevantHours = hourlyData.filter(h => h.time >= now).slice(0, 12);

    return (
        <div className="w-full overflow-x-auto scrollbar-hide snap-x">
            <div className="flex space-x-3 px-1">
                {relevantHours.map(hour => (
                    <HourlyForecastItem key={hour.time.toISOString()} hour={hour} />
                ))}
            </div>
        </div>
    );
};

export default WeatherTimeline;
