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
        <div className="space-y-8 animate-reveal pb-32 px-4 pt-4">
            {/* Header / Search */}
            <header className="space-y-6">
                <div className="flex justify-between items-center px-1">
                    <div>
                        <p className="text-textMuted text-xs font-bold uppercase tracking-widest">Bienvenido,</p>
                        <h1 className="text-3xl font-black text-textMain tracking-tight">
                            {user ? user.name.split(' ')[0] : '¡Hola!'} 👋
                        </h1>
                    </div>
                    {weatherData && (
                        <div className="scale-90 -mr-4">
                            <CompactWeatherWidget 
                                weatherData={weatherData} 
                                isLoading={isWeatherLoading} 
                                onRefresh={onRefreshWeather} 
                            />
                        </div>
                    )}
                </div>

                <div className="relative group shadow-premium rounded-3xl bg-white border border-white p-1.5 flex items-center">
                    <div className="pl-4">
                        <SearchIcon className="w-5 h-5 text-textMuted" />
                    </div>
                    <input
                        type="text"
                        placeholder="Busca canchas en tu ciudad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSearch(searchTerm)}
                        className="flex-grow bg-transparent border-none py-3 px-4 text-textMain placeholder:text-textMuted focus:outline-none font-medium text-sm"
                    />
                    <button 
                        onClick={onSearchByLocation}
                        className={`p-3.5 rounded-2xl transition-all active:scale-90 ${
                            isSearchingLocation ? 'bg-primary-50 text-brand' : 'bg-brand text-white shadow-button'
                        }`}
                    >
                        <LocationIcon className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Quick Filters */}
            <div className="flex gap-2.5 overflow-x-auto ios-scroller -mx-4 px-4 pb-2">
                {['⚽ F5', '🏟️ F7', '🏆 F11', '🏙️ Medellín', '⛪ Bogotá'].map((cat) => (
                    <button 
                        key={cat}
                        className="bg-white border border-white px-5 py-2.5 rounded-full text-xs font-bold text-textMain whitespace-nowrap shadow-premium active:scale-95 transition-transform"
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Recommendation Sections */}
            <section>
                <div className="flex justify-between items-end mb-6 px-1">
                    <h2 className="text-xl font-extrabold text-textMain tracking-tight italic">Canchas Populares</h2>
                    <button className="text-brand text-xs font-black uppercase tracking-widest">Ver Todas</button>
                </div>
                
                {loading ? (
                    <div className="grid grid-cols-1 gap-6 animate-pulse">
                        <div className="h-64 bg-gray-200 rounded-3xl"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {groupedFields.slice(0, 3).map((fieldGroup) => (
                            <FieldCard
                                key={fieldGroup[0].complexId || fieldGroup[0].id}
                                fields={fieldGroup}
                                onSelect={onSelectField}
                                isFavorite={favoriteFields.includes(fieldGroup[0].complexId || fieldGroup[0].id)}
                                onToggleFavorite={onToggleFavorite}
                                className="shadow-premium"
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Promo Card */}
            <div className="bg-gradient-to-br from-brand to-orange-400 rounded-5xl p-8 text-white relative overflow-hidden shadow-button">
                <div className="relative z-10">
                    <h3 className="text-2xl font-black italic tracking-tighter mb-2">CANCHEO PREMIUM</h3>
                    <p className="text-sm opacity-90 max-w-[180px] font-medium leading-snug">Sube tu nivel y desbloquea torneos exclusivos.</p>
                    <button className="mt-6 bg-white text-brand px-8 py-3 rounded-full font-black text-xs uppercase shadow-lg active:scale-95 transition-transform">
                        UNIRME
                    </button>
                </div>
                <div className="absolute -right-6 -bottom-6 opacity-30 transform rotate-12 scale-110">
                    <img src="https://ideogram.ai/assets/image/lossless/response/zjy_oza2RB2xuDygg3HR-Q" className="w-40 h-40" alt="Ball" />
                </div>
            </div>
        </div>
    );
};

export default Home;