import type { HourlyData, WeatherCondition, Favorability } from '../types';

/**
 * Maps WMO Weather interpretation codes to a simplified condition and icon name.
 * https://open-meteo.com/en/docs
 */
export function mapWmoCodeToIcon(code: number): WeatherCondition {
    if ([0, 1].includes(code)) return 'sunny';
    if ([2].includes(code)) return 'partly-cloudy';
    if ([3].includes(code)) return 'cloudy';
    if ([45, 48].includes(code)) return 'foggy';
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rainy';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'rainy'; // Snow mapped to rain for now
    if ([95, 96, 99].includes(code)) return 'stormy';
    return 'unknown';
}

export function getWeatherDescription(code: number): string {
    const descriptions: { [key: number]: string } = {
        0: 'Despejado', 1: 'Principalmente despejado', 2: 'Parcialmente nublado', 3: 'Nublado',
        45: 'Niebla', 48: 'Niebla con escarcha',
        51: 'Llovizna ligera', 53: 'Llovizna moderada', 55: 'Llovizna densa',
        61: 'Lluvia ligera', 63: 'Lluvia moderada', 65: 'Lluvia fuerte',
        80: 'Chubascos ligeros', 81: 'Chubascos moderados', 82: 'Chubascos violentos',
        95: 'Tormenta', 96: 'Tormenta con granizo ligero', 99: 'Tormenta con granizo fuerte',
    };
    return descriptions[code] || 'Condición desconocida';
}


export function getFavorability(hour: HourlyData): Favorability {
    const { precipitationProbability, windSpeed, temperature } = hour;
    
    // Unfavorable conditions (deal-breakers)
    if (precipitationProbability > 50) {
        return { status: 'Desfavorable', reason: `Probabilidad de lluvia alta (${precipitationProbability}%)` };
    }
    if (windSpeed > 40) {
        return { status: 'Desfavorable', reason: `Viento muy fuerte (${windSpeed.toFixed(0)} km/h)` };
    }
    if (temperature < 5 || temperature > 35) {
        return { status: 'Desfavorable', reason: `Temperatura extrema (${temperature.toFixed(0)}°C)` };
    }

    // Conditional conditions (may affect play)
    if (precipitationProbability > 20) {
        return { status: 'Condicional', reason: `Posibilidad de lluvia (${precipitationProbability}%)` };
    }
    if (windSpeed > 25) {
        return { status: 'Condicional', reason: `Viento moderado (${windSpeed.toFixed(0)} km/h)` };
    }
    if (temperature < 10 || temperature > 28) {
        return { status: 'Condicional', reason: `Temperatura fría/cálida (${temperature.toFixed(0)}°C)` };
    }

    // Favorable
    return { status: 'Favorable', reason: 'Condiciones ideales para jugar.' };
}

export function timeSince(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) {
        return `hace ${Math.floor(interval)} años`;
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return `hace ${Math.floor(interval)} meses`;
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return `hace ${Math.floor(interval)} días`;
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return `hace ${Math.floor(interval)} horas`;
    }
    interval = seconds / 60;
    if (interval > 1) {
        return `hace ${Math.floor(interval)} minutos`;
    }
    return `hace ${Math.floor(seconds)} segundos`;
}