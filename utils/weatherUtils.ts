import type { WeatherCondition, HourlyData, Favorability } from '../types';

export function mapWmoCodeToIcon(code: number): WeatherCondition {
    if (code === 0) return 'sunny';
    if (code >= 1 && code <= 2) return 'partly-cloudy';
    if (code === 3) return 'cloudy';
    if (code === 45 || code === 48) return 'foggy';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rainy';
    if (code >= 95 && code <= 99) return 'stormy';
    return 'unknown';
}

export function getFavorability(data: HourlyData): Favorability {
    if (data.weatherCode >= 95) {
         return {
            status: 'Desfavorable',
            reason: 'Se esperan tormentas eléctricas.'
        };
    }
    if (data.precipitationProbability > 60 || data.windSpeed > 30) {
        return {
            status: 'Desfavorable',
            reason: `Alta probabilidad de lluvia (${data.precipitationProbability}%) o vientos fuertes (${Math.round(data.windSpeed)} km/h).`
        };
    }
    if (data.precipitationProbability > 25) {
        return {
            status: 'Condicional',
            reason: `Posibilidad de lluvia (${data.precipitationProbability}%).`
        };
    }
    if (data.weatherCode === 45 || data.weatherCode === 48) {
         return {
            status: 'Condicional',
            reason: 'Presencia de niebla.'
        };
    }

    return {
        status: 'Favorable',
        reason: 'Buenas condiciones para jugar.'
    };
}
// FIX: Add and export the missing 'findBestPlayingTimes' function.
export function findBestPlayingTimes(hourlyData: HourlyData[]): string[] {
    const now = new Date();
    // Filter to show from the current hour up to 24 hours ahead
    const relevantHours = hourlyData.filter(h => h.time >= now).slice(0, 24);
    
    const favorableSlots: number[] = [];
    relevantHours.forEach(hour => {
        if (getFavorability(hour).status === 'Favorable') {
            favorableSlots.push(hour.time.getHours());
        }
    });

    if (favorableSlots.length === 0) {
        return [];
    }

    const periods: string[] = [];
    let startHour = favorableSlots[0];
    
    for (let i = 1; i <= favorableSlots.length; i++) { // Loop one past the end
        if (i === favorableSlots.length || favorableSlots[i] !== favorableSlots[i - 1] + 1) {
            const endHour = favorableSlots[i - 1];
            if (startHour === endHour) {
                periods.push(`${String(startHour).padStart(2, '0')}:00`);
            } else {
                periods.push(`${String(startHour).padStart(2, '0')}:00 - ${String(endHour + 1).padStart(2, '0')}:00`);
            }
            if (i < favorableSlots.length) {
                startHour = favorableSlots[i];
            }
        }
    }

    return periods;
}
