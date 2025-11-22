
import React, { useState, useMemo, useEffect } from 'react';
import type { SoccerField, User, Announcement, Theme, WeatherData, ConfirmedBooking, Team, AcceptedMatchInvite } from '../types';
import FieldCard from '../components/FieldCard';
import { SearchIcon } from '../components/icons/SearchIcon';
import { LocationIcon } from '../components/icons/LocationIcon';
import { SpinnerIcon } from '../components/icons/SpinnerIcon';
import FieldCardSkeleton from '../components/FieldCardSkeleton';
import CompactWeatherWidget from '../components/weather/CompactWeatherWidget';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { GoogleGenAI, Type } from '@google/genai';
import { calculateDistance } from '../utils/geolocation';
import ScrollOnOverflow from '../components/ScrollOnOverflow';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { PhoneIcon } from '../components/icons/PhoneIcon';
import { XIcon } from '../components/icons/XIcon';
import ConfirmationModal from '../components/ConfirmationModal';


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
    acceptedMatches?: AcceptedMatchInvite[];
    onCancelMatchAttendance?: (id: string, reason?: string) => void;
}

const opponentNames = ['Los Titanes', 'Atlético Barrial', 'Furia Roja FC', 'Deportivo Amigos', 'Guerreros FC', 'Leyendas Urbanas'];

const TeamLogo: React.FC<{ logo?: string; name: string; size?: string }> = ({ logo, name, size = 'w-16 h-16' }) => {
    const containerClasses = `${size} rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600 overflow-hidden`;

    if (logo) {
        return (
            <div className={containerClasses}>
                <img src={logo} alt={`${name} logo`} className="w-full h-full object-cover rounded-full" />
            </div>
        );
    }
    return (
        <div className={containerClasses}>
            <span className="text-2xl font-bold text-white" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.5)'}}>{name.charAt(0)}</span>
        </div>
    );
};

const getMatchTimestamps = (match: ConfirmedBooking, timezone: string): { startTs: number; endTs: number } => {
    const matchDate = new Date(match.date);
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(matchDate);
    const dateParts = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

    const datePart = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
    const naiveDate = new Date(`${datePart}T${match.time}:00`);
    const browserOffsetMs = naiveDate.getTimezoneOffset() * 60 * 1000;
    const utcDate = new Date(naiveDate.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(naiveDate.toLocaleString('en-US', { timeZone: timezone }));
    const targetOffsetMs = utcDate.getTime() - tzDate.getTime();

    const startTs = naiveDate.getTime() - (targetOffsetMs - browserOffsetMs);
    const endTs = startTs + 60 * 60 * 1000;

    return { startTs, endTs };
};


const MatchCard: React.FC<{ match: ConfirmedBooking; onSelectField: (field: SoccerField) => void; allTeams: Team[], currentTime: Date; timezone?: string }> = ({ match, onSelectField, allTeams, currentTime, timezone }) => {
    const [displayScore, setDisplayScore] = useState({ a: match.scoreA ?? 0, b: match.scoreB ?? 0 });
    const [goalAnimation, setGoalAnimation] = useState<{ team: 'A' | 'B' | null }>({ team: null });
    
    useEffect(() => {
        const currentScoreA = match.scoreA ?? 0;
        const currentScoreB = match.scoreB ?? 0;
        let goalTeam: 'A' | 'B' | null = null;

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
            }, 4000);

            return () => clearTimeout(timer);
        } else {
            if (currentScoreA !== displayScore.a || currentScoreB !== displayScore.b) {
                setDisplayScore({ a: currentScoreA, b: currentScoreB });
            }
        }
    }, [match.scoreA, match.scoreB, displayScore.a, displayScore.b]);


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
                        <ScrollOnOverflow className="font-bold mt-2 w-full text-center px-2 text-sm">
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
                        <ScrollOnOverflow className="font-bold mt-2 w-full text-center px-2 text-sm">
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

const AcceptedMatchCard: React.FC<{ 
    invite: AcceptedMatchInvite; 
    onCancel: (id: string, reason: string) => void; 
}> = ({ invite, onCancel }) => {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    
    const handleContact = () => {
        if (invite.inviterPhone) {
            const cleanPhone = invite.inviterPhone.replace(/\D/g, '');
            window.open(`https://wa.me/57${cleanPhone}`, '_blank');
        }
    };

    const formattedDate = new Date(invite.matchDate).toLocaleDateString('es-CO', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 border-[var(--color-primary-500)] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-w-[300px] flex-shrink-0">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">{invite.fieldName}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> {formattedDate}</span>
                        <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" /> {invite.matchTime}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Invitado por: <span className="font-semibold">{invite.inviterName}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                        onClick={handleContact}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-semibold text-xs hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        title="Contactar por WhatsApp"
                    >
                        <PhoneIcon className="w-4 h-4" /> Contactar
                    </button>
                    <button 
                        onClick={() => setIsCancelModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-semibold text-xs hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                        <XIcon className="w-4 h-4" /> Cancelar
                    </button>
                </div>
            </div>

            {isCancelModalOpen && (
                <ConfirmationModal
                    isOpen={isCancelModalOpen}
                    onClose={() => setIsCancelModalOpen(false)}
                    onConfirm={() => {
                        onCancel(invite.id, cancelReason);
                        setIsCancelModalOpen(false);
                        setCancelReason('');
                    }}
                    title="¿Cancelar asistencia?"
                    message={`¿Estás seguro de que quieres cancelar tu asistencia al partido en ${invite.fieldName}? Se notificará a ${invite.inviterName}.`}
                    confirmButtonText="Sí, cancelar asistencia"
                    cancelButtonText="No, mantener"
                    showInput={true}
                    inputPlaceholder="Motivo (opcional, máx 30 caracteres)"
                    inputValue={cancelReason}
                    onInputChange={setCancelReason}
                    inputMaxLength={30}
                />
            )}
        </>
    );
};

const Home: React.FC<HomeProps> = ({ onSearch, onSelectField, fields, loading, favoriteFields, onToggleFavorite, theme, announcements, user, onSearchByLocation, isSearchingLocation, weatherData, isWeatherLoading, onRefreshWeather, onSearchResults, allBookings, allTeams, currentTime, acceptedMatches, onCancelMatchAttendance }) => {
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
                 results = results.filter(f => f.pricePerHour < avgPrice * 0.8);
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

            if (statusA === 'upcoming') {
                return a.time.localeCompare(b.time);
            }
            if (statusA === 'finished') {
                return b.time.localeCompare(a.time);
            }
            return a.time.localeCompare(b.time);
        });
    
    }, [allBookings, weatherData, currentTime]);
    
    const favoriteComplexes = useMemo(() => {
        return groupedFields.filter(group => favoriteFields.includes(group[0].complexId || group[0].id));
    }, [groupedFields, favoriteFields]);

    const otherComplexes = useMemo(() => {
        return groupedFields.filter(group => !favoriteFields.includes(group[0].complexId || group[0].id));
    }, [groupedFields, favoriteFields]);

    const upcomingAcceptedMatches = useMemo(() => {
        if (!acceptedMatches) return [];
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        return acceptedMatches
            .map(m => ({ ...m, matchDate: new Date(m.matchDate) }))
            .filter(m => m.matchDate >= now)
            .sort((a, b) => a.matchDate.getTime() - b.matchDate.getTime());
    }, [acceptedMatches]);

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

            {/* Accepted Matches Section */}
            {upcomingAcceptedMatches.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        Partidos Aceptados <span className="text-sm font-normal bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">{upcomingAcceptedMatches.length}</span>
                    </h2>
                    <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                        {upcomingAcceptedMatches.map(invite => (
                            <AcceptedMatchCard 
                                key={invite.id} 
                                invite={invite} 
                                onCancel={onCancelMatchAttendance || (() => {})} 
                            />
                        ))}
                    </div>
                </section>
            )}

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
