import React, { useState, useMemo } from 'react';
import type { SoccerField, User, WeatherData } from '../types';
import FieldCard from '../components/FieldCard';
import { SearchIcon } from '../components/icons/SearchIcon';
import { LocationIcon } from '../components/icons/LocationIcon';
import CompactWeatherWidget from '../components/weather/CompactWeatherWidget';

interface HomeProps {
    onSearch: (location: string) => void;
    onSelectField: (field: SoccerField) => void;
    fields: SoccerField[];
    loading: boolean;
    favoriteFields: string[];
    onToggleFavorite: (complexId: string) => void;
    user: User | null;
    onSearchByLocation: () => void;
    isSearchingLocation: boolean;
    weatherData: WeatherData | null;
    isWeatherLoading: boolean;
    onRefreshWeather: () => void;
}

const Home: React.FC<HomeProps> = ({ 
    onSearch, onSelectField, fields, loading, favoriteFields, onToggleFavorite, 
    user, onSearchByLocation, isSearchingLocation, weatherData, isWeatherLoading, onRefreshWeather 
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const groupedFields = useMemo(() => {
        const grouped: { [key: string]: SoccerField[] } = {};
        fields.forEach(field => {
            const id = field.complexId || field.id;
            if (!grouped[id]) grouped[id] = [];
            grouped[id].push(field);
        });
        return Object.values(grouped);
    }, [fields]);

    return (
        <div className="space-y-8 animate-ios pb-32">
            {/* Header / Search Section */}
            <div className="px-1">
                <div className="flex justify-between items-end mb-6">
                    <div className="space-y-1">
                        <p className="text-gray-400 text-sm font-medium">Hola, {user ? user.name.split(' ')[0] : 'jugador'} 👋</p>
                        <h1 className="text-4xl font-black tracking-tighter text-white">Bienvenido</h1>
                    </div>
                    {weatherData && (
                        <div className="active:scale-95 transition-transform">
                            <CompactWeatherWidget 
                                weatherData={weatherData} 
                                isLoading={isWeatherLoading} 
                                onRefresh={onRefreshWeather} 
                            />
                        </div>
                    )}
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Busca canchas o ciudades..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSearch(searchTerm)}
                        className="w-full h-14 pl-12 pr-16 bg-white border-none rounded-2xl shadow-premium text-textMain placeholder:text-gray-400 font-semibold focus:ring-2 focus:ring-brand/50 transition-all outline-none"
                    />
                    <button 
                        onClick={onSearchByLocation}
                        disabled={isSearchingLocation}
                        className="absolute right-2.5 top-2.5 h-9 w-9 bg-brand text-white rounded-xl flex items-center justify-center shadow-button active:scale-90 transition-all disabled:opacity-50"
                    >
                        {isSearchingLocation ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <LocationIcon className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-3 overflow-x-auto ios-scroller -mx-4 px-4 py-2">
                {['⚽ F5', '🏟️ F7', '🏆 F11', '🏙️ Medellín', '⛪ Bogotá'].map((cat, idx) => (
                    <button 
                        key={cat}
                        className={`flex-shrink-0 px-6 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${idx === 0 ? 'bg-brand text-white shadow-button' : 'glass-card text-gray-300'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Content Section */}
            <section className="space-y-6">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-2xl font-black tracking-tight text-white italic">Canchas Populares</h2>
                    <button className="text-brand text-xs font-black uppercase tracking-widest hover:opacity-70 transition-opacity">Ver Todas</button>
                </div>
                
                {loading ? (
                    <div className="space-y-6 animate-pulse px-1">
                        <div className="h-72 bg-white/10 rounded-4xl shimmer-bg"></div>
                        <div className="h-72 bg-white/10 rounded-4xl shimmer-bg"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 px-1">
                        {groupedFields.slice(0, 5).map((fieldGroup) => (
                            <FieldCard
                                key={fieldGroup[0].complexId || fieldGroup[0].id}
                                fields={fieldGroup}
                                onSelect={onSelectField}
                                isFavorite={favoriteFields.includes(fieldGroup[0].complexId || fieldGroup[0].id)}
                                onToggleFavorite={onToggleFavorite}
                                className="animate-ios"
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Promo Banner */}
            <div className="mx-1 p-6 rounded-5xl bg-gradient-to-br from-brand to-orange-400 text-white relative overflow-hidden shadow-button group">
                <div className="relative z-10 space-y-2">
                    <h3 className="text-2xl font-black italic leading-tight">¿ERES DUEÑO DE CANCHAS?</h3>
                    <p className="text-sm font-medium opacity-90 max-w-[200px]">Únete a la red más grande y gestiona tus reservas fácilmente.</p>
                    <button className="mt-4 bg-white text-brand px-6 py-2.5 rounded-2xl font-black text-xs uppercase shadow-xl active:scale-95 transition-transform">EMPEZAR AHORA</button>
                </div>
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            </div>
        </div>
    );
};

export default Home;