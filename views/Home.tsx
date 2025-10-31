import React, { useState, useMemo } from 'react';
import type { SoccerField, User, Announcement, Theme, WeatherData } from '../types';
import FieldCard from '../components/FieldCard';
import { SearchIcon } from '../components/icons/SearchIcon';
import { LocationIcon } from '../components/icons/LocationIcon';
import { SpinnerIcon } from '../components/icons/SpinnerIcon';
import FieldCardSkeleton from '../components/FieldCardSkeleton';
import CompactWeatherWidget from '../components/weather/CompactWeatherWidget';
import { UsersFiveIcon } from '../components/icons/UsersFiveIcon';
import { UsersSevenIcon } from '../components/icons/UsersSevenIcon';
import { UsersElevenIcon } from '../components/icons/UsersElevenIcon';

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
}

const Home: React.FC<HomeProps> = ({ onSearch, onSelectField, fields, loading, favoriteFields, onToggleFavorite, theme, announcements, user, onSearchByLocation, isSearchingLocation, weatherData, isWeatherLoading, onRefreshWeather }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchTerm);
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

    const favoriteComplexes = useMemo(() => {
        return groupedFields.filter(group => favoriteFields.includes(group[0].complexId || group[0].id));
    }, [groupedFields, favoriteFields]);

    const otherComplexes = useMemo(() => {
        return groupedFields.filter(group => !favoriteFields.includes(group[0].complexId || group[0].id));
    }, [groupedFields, favoriteFields]);

    return (
        <div className="space-y-8">
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
                            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 group-focus-within:text-[var(--color-primary-500)] transition-colors" />
                            <input
                                type="text"
                                placeholder="Busca por nombre o ciudad..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-3 pl-12 pr-4 border border-gray-300 dark:border-gray-600 rounded-full text-gray-800 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 shadow-sm transition-all duration-300 focus:outline-none focus:border-transparent focus:ring-0 focus:shadow-lg focus:shadow-[var(--color-primary-500)]/30"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={onSearchByLocation}
                            disabled={isSearchingLocation}
                            className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-[var(--color-primary-600)] text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[var(--color-primary-500)] disabled:bg-[var(--color-primary-400)] disabled:cursor-not-allowed"
                            title="Buscar cerca de mí"
                            aria-label="Buscar canchas cerca de mi ubicación actual"
                        >
                            {isSearchingLocation ? <SpinnerIcon className="w-8 h-8" /> : <LocationIcon className="w-8 h-8" />}
                        </button>
                    </form>
                    <div className="text-white pt-4">
                        <CompactWeatherWidget weatherData={weatherData} isLoading={isWeatherLoading} onRefresh={onRefreshWeather} />
                    </div>
                </div>
            </header>

            {/* Size filters */}
            <div className="flex justify-center gap-2 sm:gap-4">
                <button onClick={() => onSearch('', { size: '5v5' })} className="flex items-center gap-2 py-2 px-5 rounded-full text-sm sm:text-base font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] transition">
                    <UsersFiveIcon className="w-5 h-5" />
                    <span>Fútbol 5</span>
                </button>
                <button onClick={() => onSearch('', { size: '7v7' })} className="flex items-center gap-2 py-2 px-5 rounded-full text-sm sm:text-base font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] transition">
                    <UsersSevenIcon className="w-5 h-5" />
                    <span>Fútbol 7</span>
                </button>
                <button onClick={() => onSearch('', { size: '11v11' })} className="flex items-center gap-2 py-2 px-5 rounded-full text-sm sm:text-base font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] transition">
                    <UsersElevenIcon className="w-5 h-5" />
                    <span>Fútbol 11</span>
                </button>
            </div>
            
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