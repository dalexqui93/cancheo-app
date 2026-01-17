import React from 'react';
import type { WeatherData } from '../../types';
import { getFavorability, mapWmoCodeToIcon } from '../../utils/weatherUtils';
import WeatherIcon from '../icons/WeatherIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { BanIcon } from '../icons/BanIcon';
import { InformationCircleIcon } from '../icons/InformationCircleIcon';

interface BookingWeatherStatusProps {
    weatherData: WeatherData | null;
    selectedDate: Date;
    selectedTime: string | null;
}

const BookingWeatherStatus: React.FC<BookingWeatherStatusProps> = ({ weatherData, selectedDate, selectedTime }) => {
    if (!weatherData || !selectedTime) {
        return null;
    }

    const targetDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    targetDateTime.setHours(hours, minutes, 0, 0);

    const relevantHourData = weatherData.hourly.find(h => {
        const hourDate = new Date(h.time);
        return hourDate.getFullYear() === targetDateTime.getFullYear() &&
               hourDate.getMonth() === targetDateTime.getMonth() &&
               hourDate.getDate() === targetDateTime.getDate() &&
               hourDate.getHours() === targetDateTime.getHours();
    });
    
    if (!relevantHourData) {
        return (
             <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-[24px] border border-dashed border-borderDefault-light dark:border-borderDefault-dark flex items-center gap-3">
                <InformationCircleIcon className="w-5 h-5 text-textMuted-light" />
                <p className="text-xs font-bold text-textMuted-light uppercase tracking-widest">Pronóstico no disponible</p>
            </div>
        );
    }

    const favorability = getFavorability(relevantHourData);
    const condition = mapWmoCodeToIcon(relevantHourData.weatherCode);

    const config = {
        'Favorable': {
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            border: 'border-emerald-200 dark:border-emerald-800',
            text: 'text-emerald-800 dark:text-emerald-300',
            accent: 'bg-emerald-500',
            icon: <SparklesIcon className="w-4 h-4" />
        },
        'Condicional': {
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            border: 'border-amber-200 dark:border-amber-800',
            text: 'text-amber-800 dark:text-amber-300',
            accent: 'bg-amber-500',
            icon: <InformationCircleIcon className="w-4 h-4" />
        },
        'Desfavorable': {
            bg: 'bg-rose-50 dark:bg-rose-900/20',
            border: 'border-rose-200 dark:border-rose-800',
            text: 'text-rose-800 dark:text-rose-300',
            accent: 'bg-rose-500',
            icon: <BanIcon className="w-4 h-4" />
        },
    };

    const style = config[favorability.status];

    return (
        <div className={`p-5 rounded-[32px] border-2 transition-all duration-500 animate-ios ${style.bg} ${style.border} shadow-sm group`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-white ${style.accent}`}>
                        {style.icon}
                        {favorability.status}
                    </div>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black italic tracking-tighter">{Math.round(relevantHourData.temperature)}°</span>
                    <span className="text-[10px] font-bold opacity-60">C</span>
                </div>
            </div>
            
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-white/50 dark:bg-black/20 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform">
                    <WeatherIcon condition={condition} className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                    <p className={`text-sm font-black italic uppercase tracking-tight ${style.text}`}>
                        {condition === 'sunny' ? 'Cielo Despejado' : 
                         condition === 'rainy' ? 'Probabilidad de Lluvia' :
                         condition === 'cloudy' ? 'Nublado' :
                         condition === 'stormy' ? 'Tormenta Eléctrica' : 'Cielo Parcialmente Nublado'}
                    </p>
                    <p className="text-xs font-medium leading-relaxed opacity-80">
                        {favorability.reason}
                    </p>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex gap-6">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase opacity-50 tracking-widest">Precipitación</span>
                    <span className="text-xs font-bold">{relevantHourData.precipitationProbability}%</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase opacity-50 tracking-widest">Viento</span>
                    <span className="text-xs font-bold">{Math.round(relevantHourData.windSpeed)} km/h</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase opacity-50 tracking-widest">Humedad</span>
                    <span className="text-xs font-bold">{relevantHourData.apparentTemperature.toFixed(0)}° (Sensación)</span>
                </div>
            </div>
        </div>
    );
};

export default BookingWeatherStatus;