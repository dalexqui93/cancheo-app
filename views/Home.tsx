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

const MatchCard: React.FC<{ match: ConfirmedBooking; onSelectField: (field: SoccerField) => void; allTeams: Team[], timezone?: string }> = ({ match, onSelectField, allTeams, timezone }) => {
    const teamNameA = match.teamName || match.userName;
    const rivalNameB = match.rivalName || opponentNames[match.id.charCodeAt(match.id.length - 1) % opponentNames.length];

    const teamA = allTeams.find(t => t.name.toLowerCase() === teamNameA.toLowerCase());
    const teamB = allTeams.find(t => t.name.toLowerCase() === rivalNameB.toLowerCase());
    
    const [countdown, setCountdown] = useState('');
    const [isLive, setIsLive] = useState(false);

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

    useEffect(() => {
        if (!timezone) return;

        const updateMatchStatus = () => {
            const formatter = new Intl.DateTimeFormat('sv-SE', {
                timeZone: timezone,
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false
            });

            // 1. Construir la fecha de inicio del partido en la zona horaria local del navegador.
            // La zona horaria se corregirá al formatear a string.
            const [hour, minute] = match.time.split(':').map(Number);
            const matchStartDateTime = new Date(match.date);
            matchStartDateTime.setHours(hour, minute, 0, 0);

            // 2. Un partido dura 60 minutos. Calcular la hora de finalización.
            const MATCH_DURATION_MS = 60 * 60 * 1000;
            const matchEndDateTime = new Date(matchStartDateTime.getTime() + MATCH_DURATION_MS);

            // 3. Convertir todas las fechas a strings en formato ISO en la zona horaria correcta del usuario (obtenida del clima)
            // para una comparación 100% fiable.
            const nowStr = formatter.format(new Date()).replace(' ', 'T');
            const startStr = formatter.format(matchStartDateTime).replace(' ', 'T');
            const endStr = formatter.format(matchEndDateTime).replace(' ', 'T');
            
            // 4. Determinar si el partido está actualmente en vivo.
            const isMatchLive = nowStr >= startStr && nowStr < endStr;

            if (isMatchLive) {
                setIsLive(true);
                // Para el contador, se convierten los strings de la zona horaria correcta a timestamps.
                const endTs = new Date(endStr).getTime();
                const nowTs = new Date(nowStr).getTime();
                
                const remainingSeconds = Math.max(0, Math.floor((endTs - nowTs) / 1000));
                const minutesLeft = Math.floor(remainingSeconds / 60);
                const secondsLeft = remainingSeconds % 60;
                
                setCountdown(`${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`);
            } else if (nowStr >= endStr) {
                setIsLive(false);
                setCountdown('Finalizado');
            } else {
                setIsLive(false);
                setCountdown(''); // El partido aún no ha comenzado.
            }
        };
        
        updateMatchStatus(); // Ejecutar inmediatamente para el estado inicial.
        const intervalId = setInterval(updateMatchStatus, 1000); // Actualizar cada segundo.

        return () => clearInterval(intervalId); // Limpiar el intervalo al desmontar.
    }, [match.date, match.time, timezone]);


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
                <div className="flex justify-between items-start text-xs mb-2">
                    <p className="font-bold truncate max-w-[70%]">{match.field.name}</p>
                    <p className="font-bold">{formattedTime}</p>
                </div>
                
                {isLive && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse-live">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        <span>VIVO</span>
                        <span className="font-mono tracking-wider">{countdown}</span>
                    </div>
                )}
                
                <div className="flex-grow flex items-center justify-around my-2">
                    <div className="flex flex-col items-center text-center w-28">
                        <TeamLogo logo={teamA?.logo} name={teamNameA} />
                        <p className="font-bold mt-2 truncate w-full">{teamNameA}</p>
                    </div>
                    
                    <div className="text-2xl font-black text-gray-400">VS</div>
                    
                    <div className="flex flex-col items-center text-center w-28">
                        <TeamLogo logo={teamB?.logo} name={rivalNameB} />
                        <p className="font-bold mt-2 truncate w-full">{rivalNameB}</p>
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

const Home: React.FC<HomeProps> = ({ onSearch, onSelectField, fields, loading, favoriteFields, onToggleFavorite, theme, announcements, user, onSearchByLocation, isSearchingLocation, weatherData, isWeatherLoading, onRefreshWeather, onSearchResults, allBookings, allTeams }) => {
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
    
        // Utiliza `formatToParts` para una comparación robusta de fechas que ignora la zona horaria del navegador.
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', { timeZone: targetTimezone, year: 'numeric', month: 'numeric', day: 'numeric' });
        
        const todayParts = formatter.formatToParts(now);
        const todayYear = todayParts.find(p => p.type === 'year')?.value;
        const todayMonth = todayParts.find(p => p.type === 'month')?.value;
        const todayDay = todayParts.find(p => p.type === 'day')?.value;
    
        const todayMatchesInCity = allBookings.filter(booking => {
            if (!booking.date || !booking.status || booking.field.latitude == null || booking.field.longitude == null) {
                return false;
            }
            
            const distance = calculateDistance(userLat, userLon, booking.field.latitude, booking.field.longitude);
            if (distance > CITY_RADIUS_KM || booking.status !== 'confirmed') {
                return false;
            }

            // Compara los componentes de la fecha (año, mes, día) en la zona horaria del usuario.
            const bookingDate = new Date(booking.date);
            const bookingParts = formatter.formatToParts(bookingDate);
            const bookingYear = bookingParts.find(p => p.type === 'year')?.value;
            const bookingMonth = bookingParts.find(p => p.type === 'month')?.value;
            const bookingDay = bookingParts.find(p => p.type === 'day')?.value;
            
            const isToday = bookingYear === todayYear && bookingMonth === todayMonth && bookingDay === todayDay;
            
            return isToday;
        });
    
        return todayMatchesInCity.sort((a, b) => a.time.localeCompare(b.time));
    
    }, [allBookings, weatherData]);

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
                {loading ? (
                    <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-80 h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl shimmer-bg"></div>
                        ))}
                    </div>
                ) : matchesInUserCity.length > 0 ? (
                    <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                        {matchesInUserCity.map(match => (
                            <MatchCard key={match.id} match={match} onSelectField={onSelectField} allTeams={allTeams} timezone={weatherData?.timezone} />
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