import React, { useState, useMemo, useEffect } from 'react';
import type { SoccerField, User, Announcement, Theme, WeatherData, ConfirmedBooking, Team } from '../types';
import FieldCard from '../components/FieldCard';
import { SearchIcon } from '../components/icons/SearchIcon';
import { LocationIcon } from '../components/icons/LocationIcon';
import { SpinnerIcon } from '../components/icons/SpinnerIcon';
import FieldCardSkeleton from '../components/FieldCardSkeleton';
import CompactWeatherWidget from '../components/weather/CompactWeatherWidget';
import { UsersFiveIcon } from '../components/icons/UsersFiveIcon';
import { UsersSevenIcon } from '../components/icons/UsersSevenIcon';
import { UsersElevenIcon } from '../components/icons/UsersElevenIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { GoogleGenAI, Type } from '@google/genai';
import { calculateDistance } from '../utils/geolocation';
import ScrollOnOverflow from '../components/ScrollOnOverflow';


interface HomeProps {
    onSearch: (location: string, filters?: { size?: '5v5' | '7v7' | '11v11' }) => void;
    onSelectField: (field: SoccerField) => void;
    fields: SoccerField[];
    loading: boolean;
    favoriteFields: string[];
    onToggleFavorite: (complexId: string) => void;
    theme: Theme;
    announcements: Announcement[];
    user: User | null;
    onSearchByLocation: () => void;
    isSearchingLocation: boolean;
    weatherData: WeatherData | null;
    isWeatherLoading: boolean;
    onRefreshWeather: () => void;
    onSearchResults: (results: SoccerField[]) => void;
    allBookings: ConfirmedBooking[];
    allTeams: Team[];
    currentTime: Date;
}

const opponentNames = ['Los Titanes', 'Atlético Barrial', 'Furia Roja FC', 'Deportivo Amigos', 'Guerreros FC', 'Leyendas Urbanas'];

const TeamLogo: React.FC<{ logo?: string; name: string; size?: string }> = ({ logo, name, size = 'w-16 h-16' }) => {
    if (logo) {
        return <img src={logo} alt={`${name} logo`} className={`${size} object-contain`} />;
    }
    return (
        <div className={`${size} rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600`}>
            <span className="text-2xl font-bold text-white" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.5)'}}>{name.charAt(0)}</span>
        </div>
    );
};

const getMatchTimestamps = (match: ConfirmedBooking, timezone: string): { startTs: number; endTs: number } => {
    // Step 1: Get the calendar date components (year, month, day) in the target timezone.
    // This avoids "day before/after" issues if the user's browser is in a different day than the match location.
    const matchDate = new Date(match.date);
    // Fix: Correctly type the dateParts object by using Object.fromEntries instead of reduce with an empty initial object.
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(matchDate);
    const dateParts = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

    const datePart = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;

    // Step 2: Create a naive Date object from the local date and time string.
    // JavaScript will interpret this using the browser's local timezone, which is what we want for now.
    const naiveDate = new Date(`${datePart}T${match.time}:00`);

    // Step 3: Calculate the offset of the browser's timezone from UTC.
    // getTimezoneOffset returns minutes, so we convert to milliseconds.
    const browserOffsetMs = naiveDate.getTimezoneOffset() * 60 * 1000;

    // Step 4: Calculate the offset of the target timezone from UTC for that specific date.
    // This is the key to correctly handling different timezones and daylight saving time.
    // We create a date string for the target timezone and one for UTC from the same timestamp,
    // then find the difference in their milliseconds value.
    const utcDate = new Date(naiveDate.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(naiveDate.toLocaleString('en-US', { timeZone: timezone }));
    const targetOffsetMs = utcDate.getTime() - tzDate.getTime();

    // Step 5: The correct start timestamp is the naive timestamp (based on browser's parsing)
    // adjusted by the difference between the two offsets.
    const startTs = naiveDate.getTime() - (targetOffsetMs - browserOffsetMs);
    const endTs = startTs + 60 * 60 * 1000; // Match duration is 60 minutes

    return { startTs, endTs };
};


const MatchCard: React.FC<{ match: ConfirmedBooking; onSelectField: (field: SoccerField) => void; allTeams: Team[], currentTime: Date; timezone?: string }> = ({ match, onSelectField, allTeams, currentTime, timezone }) => {
    const [displayScore, setDisplayScore] = useState({ a: match.scoreA ?? 0, b: match.scoreB ?? 0 });
    const [goalAnimation, setGoalAnimation] = useState<{ team: 'A' | 'B' | null }>({ team: null });
    
    useEffect(() => {
        const currentScoreA = match.scoreA ?? 0;
        const currentScoreB = match.scoreB ?? 0;
        let goalTeam: 'A' | 'B' | null = null;

        // Detect score increase for animation
        if (currentScoreA > displayScore.a) {
            goalTeam = 'A';
        } else if (currentScoreB > displayScore.b) {
            goalTeam = 'B';
        }

        if (goalTeam) {
            setGoalAnimation({ team: goalTeam });
            const timer = setTimeout(() => {
                setDisplayScore({ a: currentScoreA, b: currentScoreB });
                setGoalAnimation({ team: null });
            }, 4000); // Animation duration

            return () => clearTimeout(timer);
        } else {
            // If scores decrease or are just different (e.g., initial load), update immediately.
            if (currentScoreA !== displayScore.a || currentScoreB !== displayScore.b) {
                setDisplayScore({ a: currentScoreA, b: currentScoreB });
            }
        }
    }, [match.scoreA, match.scoreB]);


    const teamNameA = match.teamName || match.userName;
    const rivalNameB = match.rivalName || opponentNames[match.id.charCodeAt(match.id.length - 1) % opponentNames.length];

    const teamA = allTeams.find(t => t.name.toLowerCase() === teamNameA.toLowerCase());
    const teamB = allTeams.find(t => t.name.toLowerCase() === rivalNameB.toLowerCase());

    const formattedTime = useMemo(() => {
        if (!match.time) return '';
        const [hour, minute] = match.time.split(':').map(Number);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        let hour12 = hour % 12;
        if (hour12 === 0) {
            hour12 = 12;
        }
        return `${hour12}:${String(minute).padStart(2, '0')} ${ampm}`;
    }, [match.time]);

    const { matchStatus, countdown } = useMemo(() => {
        if (!match.date || !match.time) {
            return { matchStatus: 'upcoming' as const, countdown: '' };
        }
        
        const matchTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        const { startTs } = getMatchTimestamps(match, matchTimezone);
        const nowTs = currentTime.getTime();

        const endOfMatchTs = startTs + 60 * 60 * 1000;
        const endOfGracePeriodTs = startTs + 2 * 60 * 60 * 1000;
        
        if (match.status === 'completed' || match.status === 'cancelled' || nowTs >= endOfGracePeriodTs) {
            return { matchStatus: 'finished' as const, countdown: '' };
        }
        
        if (nowTs < startTs) {
            return { matchStatus: 'upcoming' as const, countdown: '' };
        }

        if (nowTs >= startTs && nowTs < endOfMatchTs) {
            const remainingSeconds = Math.max(0, Math.floor((endOfMatchTs - nowTs) / 1000));
            const minutesLeft = Math.floor(remainingSeconds / 60);
            const secondsLeft = remainingSeconds % 60;
            const countdownStr = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
            return { matchStatus: 'live' as const, countdown: countdownStr };
        }

        if (nowTs >= endOfMatchTs) {
            return { matchStatus: 'waiting' as const, countdown: '' };
        }
        
        return { matchStatus: 'upcoming' as const, countdown: '' };
    }, [match, currentTime, timezone]);

    const isFinished = matchStatus === 'finished';
    const showScore = matchStatus === 'live' || matchStatus === 'finished' || matchStatus === 'waiting';

    return (
        <div 
            className="flex-shrink-0 w-80 rounded-2xl shadow-lg overflow-hidden border border-white/10 relative text-white"
            style={{
                backgroundImage: `url('https://i.pinimg.com/1200x/4b/09/c1/4b09c1845862b6d4f29e8fe129d5af24.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className="absolute inset-0 bg-black/[.35] backdrop-blur-sm"></div>
            
            <div className="p-4 relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start text-xs mb-2 gap-2">
                    <ScrollOnOverflow className="font-bold flex-grow min-w-0">
                        {match.field.name}
                    </ScrollOnOverflow>
                    <div className={`flex-shrink-0 flex items-center gap-1.5 text-white text-xs font-bold px-2 py-1 rounded-full ${
                        matchStatus === 'live' ? 'bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse-live' : 
                        matchStatus === 'waiting' ? 'bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.7)] animate-pulse-live' :
                        matchStatus === 'finished' ? 'bg-gray-600' :
                        'bg-black/40'
                    }`}>
                        {matchStatus === 'live' && (
                            <>
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                <span>VIVO</span>
                                {countdown && <span className="font-mono tracking-wider">{countdown}</span>}
                            </>
                        )}
                        {matchStatus === 'waiting' && (
                             <>
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                <span>Confirmando resultado</span>
                            </>
                        )}
                        {matchStatus === 'finished' && (
                            <span>Finalizado</span>
                        )}
                        {matchStatus === 'upcoming' && <span>{formattedTime}</span>}
                    </div>
                </div>
                
                <div className="flex-grow flex items-center justify-between my-2">
                    <div className="flex flex-col items-center text-center flex-1 min-w-0">
                        <div className="relative">
                            <TeamLogo logo={teamA?.logo} name={teamNameA} />
                            {goalAnimation.team === 'A' && <div className="goal-animation-text goal-animation-local">¡Gool!</div>}
                        </div>
                        <ScrollOnOverflow className="font-bold mt-2 w-full text-center px-2">
                            {teamNameA}
                        </ScrollOnOverflow>
                    </div>
                    
                    <div className="text-center flex-shrink-0 mx-1 relative">
                        <div className="h-12 flex items-center justify-center">
                            {showScore ? (
                                <div className="text-4xl font-black text-white flex items-center justify-center gap-4 animate-fade-in">
                                    <span>{displayScore.a}</span>
                                    <span className="text-gray-400">-</span>
                                    <span>{displayScore.b}</span>
                                </div>
                            ) : (
                                <div className="text-2xl font-black text-gray-400">VS</div>
                            )}
                        </div>
                        {(isFinished || matchStatus === 'waiting') && (
                            <p className="text-xs text-gray-400 mt-1">{formattedTime}</p>
                        )}
                    </div>
                    
                    <div className="flex flex-col items-center text-center flex-1 min-w-0">
                        <div className="relative">
                             <TeamLogo logo={teamB?.logo} name={rivalNameB} />
                             {goalAnimation.team === 'B' && <div className="goal-animation-text goal-animation-visitor">¡Gool!</div>}
                        </div>
                        <ScrollOnOverflow className="font-bold mt-2 w-full text-center px-2">
                            {rivalNameB}
                        </ScrollOnOverflow>
                    </div>
                </div>
                
                <button 
                    onClick={() => onSelectField(match.field)}
                    className="w-full text-center bg-white/10 hover:bg-white/20 transition-colors font-semibold py-2 px-4 rounded-lg text-sm mt-auto"
                >
                    Ver Cancha
                </button>
            </div>
        </div>
    );
};

const Home: React.FC<HomeProps> = ({ onSearch, onSelectField, fields, loading, favoriteFields, onToggleFavorite, theme, announcements, user, onSearchByLocation, isSearchingLocation, weatherData, isWeatherLoading, onRefreshWeather, onSearchResults, allBookings, allTeams, currentTime }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAiSearching, setIsAiSearching] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    const handleAiSearch = async () => {
        if (!searchTerm.trim()) {
            onSearch(searchTerm);
            return;
        }
    
        setIsAiSearching(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: `Analiza la consulta del usuario para encontrar una cancha de fútbol y extrae los criterios relevantes. La consulta es: "${searchTerm}". Responde ÚNICAMENTE con un objeto JSON.`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            location: { type: Type.STRING, description: 'La ciudad, barrio o lugar específico mencionado.' },
                            size: { type: Type.STRING, description: 'El tamaño de la cancha como "5v5", "7v7", o "11v11".' },
                            price_max: { type: Type.NUMBER, description: 'El precio máximo por hora si se menciona.' },
                            price_preference: { type: Type.STRING, description: 'Preferencia de precio como "barato" o "económico".' },
                            amenities: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Una lista de servicios requeridos como "parqueadero", "cafetería", "luces", "cerveza".' },
                        },
                    },
                },
            });
    
            const criteria = JSON.parse(response.text);
            
            let results = fields;
    
            if (criteria.location) {
                const loc = criteria.location.toLowerCase();
                results = results.filter(f => 
                    f.city.toLowerCase().includes(loc) || 
                    f.address.toLowerCase().includes(loc) || 
                    f.name.toLowerCase().includes(loc)
                );
            }
    
            if (criteria.size) {
                const size = criteria.size.toLowerCase();
                if(size.includes('5')) results = results.filter(f => f.size === '5v5');
                else if(size.includes('7')) results = results.filter(f => f.size === '7v7');
                else if(size.includes('11')) results = results.filter(f => f.size === '11v11');
            }
    
            if (criteria.amenities && criteria.amenities.length > 0) {
                results = results.filter(f => 
                    criteria.amenities.every((amenity: string) => 
                        f.services.some(s => s.name.toLowerCase().includes(amenity.toLowerCase()))
                    )
                );
            }

            if (criteria.price_max) {
                results = results.filter(f => f.pricePerHour <= criteria.price_max);
            } else if (criteria.price_preference && (criteria.price_preference === 'barato' || criteria.price_preference === 'económico')) {
                 const avgPrice = fields.reduce((acc, f) => acc + f.pricePerHour, 0) / fields.length;
                 results = results.filter(f => f.pricePerHour < avgPrice * 0.8); // 20% below average
            }
            
            onSearchResults(results);
    
        } catch (error) {
            console.error("Búsqueda con IA fallida:", String(error));
            onSearch(searchTerm);
        } finally {
            setIsAiSearching(false);
        }
    };

    const groupedFields = useMemo(() => {
        const grouped: { [key: string]: SoccerField[] } = {};
        fields.forEach(field => {
            const id = field.complexId || field.id;
            if (!grouped[id]) grouped[id] = [];
            grouped[id].push(field);
        });
        return Object.values(grouped);
    }, [fields]);

    const matchesInUserCity = useMemo(() => {
        if (!allBookings || allBookings.length === 0 || !weatherData?.timezone || weatherData.latitude == null || weatherData.longitude == null) {
            return [];
        }
    
        const targetTimezone = weatherData.timezone;
        const userLat = weatherData.latitude;
        const userLon = weatherData.longitude;
        const CITY_RADIUS_KM = 50;
    
        const now = currentTime;
        // 'en-CA' format is YYYY-MM-DD which is robust for comparisons
        const todayString = now.toLocaleDateString('en-CA', { timeZone: targetTimezone });
    
        const todayMatchesInCity = allBookings.filter(booking => {
            if (!booking.date || !booking.status || booking.field.latitude == null || booking.field.longitude == null) {
                return false;
            }
            
            const distance = calculateDistance(userLat, userLon, booking.field.latitude, booking.field.longitude);
            if (distance > CITY_RADIUS_KM || booking.status === 'cancelled') {
                return false;
            }

            const bookingDate = new Date(booking.date);
            const bookingDateString = bookingDate.toLocaleDateString('en-CA', { timeZone: targetTimezone });
            
            const isToday = bookingDateString === todayString;
            
            return isToday;
        });
    
        const getStatus = (match: ConfirmedBooking) => {
            if (match.status === 'completed') return 'finished';
            const { startTs, endTs } = getMatchTimestamps(match, targetTimezone);
            const nowTs = now.getTime();
            if (nowTs >= startTs && nowTs < endTs) return 'live';
            if (nowTs >= endTs) return 'finished';
            return 'upcoming';
        };

        return todayMatchesInCity.sort((a, b) => {
            const statusOrder = { live: 1, upcoming: 2, finished: 3 };
            const statusA = getStatus(a);
            const statusB = getStatus(b);

            if (statusOrder[statusA] !== statusOrder[statusB]) {
                return statusOrder[statusA] - statusOrder[statusB];
            }

            // If status is the same, sort by time
            if (statusA === 'upcoming') {
                return a.time.localeCompare(b.time); // Earliest upcoming first
            }
            if (statusA === 'finished') {
                return b.time.localeCompare(a.time); // Most recently finished first
            }
            // For live matches, sort by start time
            return a.time.localeCompare(b.time);
        });
    
    }, [allBookings, weatherData, currentTime]);
    
    const favoriteComplexes = useMemo(() => {
        return groupedFields.filter(group => favoriteFields.includes(group[0].complexId || group[0].id));
    }, [groupedFields, favoriteFields]);

    const otherComplexes = useMemo(() => {
        return groupedFields.filter(group => !favoriteFields.includes(group[0].complexId || group[0].id));
    }, [groupedFields, favoriteFields]);

    return (
        <div className="space-y-8 pb-[5.5rem] md:pb-4">
            {/* Header and Search */}
            <header 
                className="relative text-center space-y-6 p-8 sm:p-12 rounded-3xl overflow-hidden -mt-6 sm:-mt-8 -mx-4 sm:mx-0"
                style={{
                    backgroundImage: "url('https://i.pinimg.com/736x/5d/60/1a/5d601ae74e510c3d8c42a6b8fb34f855.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative z-10 space-y-6">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
                        Encuentra tu <span className="text-[var(--color-primary-400)]">cancha</span> ideal
                    </h1>
                    <p className="text-lg text-gray-200 max-w-2xl mx-auto" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>
                        Busca, reserva y juega en las mejores canchas de fútbol de tu ciudad.
                    </p>
                    <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2 items-center relative">
                        <div className="relative flex-grow group">
                            <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 group-focus-within:text-[var(--color-primary-500)] transition-colors">
                                <SearchIcon />
                            </button>
                            <input
                                type="text"
                                placeholder="Cancha 7v7 barata en Medellín..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-3 pl-12 pr-4 border border-gray-300 dark:border-gray-600 rounded-full text-gray-800 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 shadow-sm transition-all duration-300 focus:outline-none focus:border-transparent focus:ring-0 focus:shadow-lg focus:shadow-[var(--color-primary-500)]/30"
                            />
                        </div>
                         <button
                            type="button"
                            onClick={onSearchByLocation}
                            disabled={isSearchingLocation || isAiSearching}
                            className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[var(--color-primary-500)] disabled:opacity-50"
                            title="Buscar cerca de mí"
                            aria-label="Buscar canchas cerca de mi ubicación actual"
                        >
                            {isSearchingLocation ? <SpinnerIcon className="w-6 h-6" /> : <LocationIcon className="w-6 h-6" />}
                        </button>
                        <button
                            type="button"
                            onClick={handleAiSearch}
                            disabled={isAiSearching || isSearchingLocation}
                            className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-[var(--color-primary-600)] text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[var(--color-primary-500)] disabled:bg-[var(--color-primary-400)] disabled:cursor-not-allowed"
                            title="Búsqueda Inteligente con IA"
                            aria-label="Realizar búsqueda inteligente con Inteligencia Artificial"
                        >
                            {isAiSearching ? <SpinnerIcon className="w-6 h-6" /> : <SparklesIcon className="w-6 h-6" />}
                        </button>
                    </form>
                    <div className="text-white pt-4">
                        <CompactWeatherWidget weatherData={weatherData} isLoading={isWeatherLoading} onRefresh={onRefreshWeather} />
                    </div>
                </div>
            </header>

            {/* Size filters */}
            <div className="flex justify-center gap-2 sm:gap-4">
                <button 
                    onClick={() => onSearch('', { size: '5v5' })} 
                    className="py-2.5 px-6 rounded-full text-sm sm:text-base font-bold text-blue-800 dark:text-blue-200 bg-blue-100/50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg hover:shadow-blue-500/20"
                >
                    Fútbol 5
                </button>
                <button 
                    onClick={() => onSearch('', { size: '7v7' })} 
                    className="py-2.5 px-6 rounded-full text-sm sm:text-base font-bold text-green-800 dark:text-green-200 bg-green-100/50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800/50 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg hover:shadow-green-500/20"
                >
                    Fútbol 7
                </button>
                <button 
                    onClick={() => onSearch('', { size: '11v11' })} 
                    className="py-2.5 px-6 rounded-full text-sm sm:text-base font-bold text-orange-800 dark:text-orange-200 bg-orange-100/50 dark:bg-orange-900/30 border-2 border-orange-200 dark:border-orange-800/50 hover:border-orange-400 dark:hover:border-orange-600 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg hover:shadow-orange-500/20"
                >
                    Fútbol 11
                </button>
            </div>

            {/* Today's Matches */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Partidos de Hoy {weatherData?.locationName && <span className="text-[var(--color-primary-500)]">cerca de ti</span>}
                </h2>
                {loading || isWeatherLoading ? (
                    <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-80 h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl shimmer-bg"></div>
                        ))}
                    </div>
                ) : (matchesInUserCity.length > 0) ? (
                    <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                        {matchesInUserCity.map(match => (
                            <MatchCard key={match.id} match={match} onSelectField={onSelectField} allTeams={allTeams} currentTime={currentTime} timezone={weatherData?.timezone} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
                        <p className="text-gray-600 dark:text-gray-400">No hay partidos programados cerca de ti para hoy.</p>
                    </div>
                )}
            </section>
            
            {/* Announcements */}
            {announcements && announcements.length > 0 && (
                <section>
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2">Anuncios Recientes</h2>
                        <p className="text-blue-700 dark:text-blue-400">{announcements[0].message}</p>
                    </div>
                </section>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <FieldCardSkeleton key={i} />)}
                </div>
            ) : (
                <>
                    {/* Favorite Fields */}
                    {user && favoriteComplexes.length > 0 && (
                         <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Tus Favoritos</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {favoriteComplexes.map((fieldGroup) => (
                                    <FieldCard
                                        key={fieldGroup[0].complexId || fieldGroup[0].id}
                                        fields={fieldGroup}
                                        onSelect={onSelectField}
                                        isFavorite={true}
                                        onToggleFavorite={onToggleFavorite}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                     {/* Other fields */}
                     <section>
                         <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            {user && favoriteComplexes.length > 0 ? 'Otras Canchas' : 'Canchas Destacadas'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {otherComplexes.map((fieldGroup) => (
                                <FieldCard
                                    key={fieldGroup[0].complexId || fieldGroup[0].id}
                                    fields={fieldGroup}
                                    onSelect={onSelectField}
                                    isFavorite={favoriteFields.includes(fieldGroup[0].complexId || fieldGroup[0].id)}
                                    onToggleFavorite={onToggleFavorite}
                                />
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default Home;