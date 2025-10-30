import React from 'react';
import type { WeatherData } from '../../types';
import { getFavorability, mapWmoCodeToIcon } from '../../utils/weatherUtils';
import WeatherIcon from '../icons/WeatherIcon';

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
             <div className="p-3 mb-2 text-xs text-center bg-gray-100 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400">
                Pronóstico del tiempo no disponible para esta fecha.
            </div>
        );
    }

    const favorability = getFavorability(relevantHourData);
    const condition = mapWmoCodeToIcon(relevantHourData.weatherCode);

    const statusClasses = {
        'Favorable': 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
        'Condicional': 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
        'Desfavorable': 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300',
    };

    return (
        <div className={`p-3 mb-3 rounded-lg flex items-center gap-3 ${statusClasses[favorability.status]}`}>
            <div className="flex-shrink-0">
                <WeatherIcon condition={condition} className="w-8 h-8" />
            </div>
            <div>
                <p className="font-bold text-sm">Clima {favorability.status}</p>
                <p className="text-xs">{favorability.reason}</p>
            </div>
        </div>
    );
};

export default BookingWeatherStatus;