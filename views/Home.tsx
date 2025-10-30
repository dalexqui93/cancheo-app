import React, { useState, useMemo } from 'react';
import type { SoccerField, Theme, Announcement, User } from '../types';
import { SearchIcon } from '../components/icons/SearchIcon';
import FieldCard from '../components/FieldCard';
import { TacticBoardFiveIcon } from '../components/icons/TacticBoardFiveIcon';
import { TacticBoardSevenIcon } from '../components/icons/TacticBoardSevenIcon';
import { MapIcon } from '../components/icons/MapIcon';
import { ListIcon } from '../components/icons/ListIcon';
import MapView from './MapView';
import { MegaphoneIcon } from '../components/icons/MegaphoneIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { LocationIcon } from '../components/icons/LocationIcon';
import FieldCardSkeleton from '../components/FieldCardSkeleton';


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
}

const CategoryButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-full dark:border dark:border-gray-700 dark:hover:bg-gray-700">
        {icon}
        <span className="font-bold text-gray-800 dark:text-gray-200">{label}</span>
    </button>
);


const Home: React.FC<HomeProps> = ({ onSearch, onSelectField, fields, loading, favoriteFields, onToggleFavorite, theme, announcements, user, onSearchByLocation, isSearchingLocation }) => {
    const [location, setLocation] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [hoveredComplexId, setHoveredComplexId] = useState<string | null>(null);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(location);
    };

    const handleCategorySearch = (size: '5v5' | '7v7' | '11v11') => {
        onSearch('', { size });
    };

    const complexes = useMemo(() => {
        const grouped: { [key: string]: SoccerField[] } = {};
        fields.forEach(field => {
            const id = field.complexId || field.id;
            if (!grouped[id]) grouped[id] = [];
            grouped[id].push(field);
        });
        return Object.values(grouped);
    }, [fields]);
    

    const filteredAnnouncements = useMemo(() => {
        if (!user || !user.favoriteFields) {
            return [];
        }
        
        const favoriteComplexIds = new Set(user.favoriteFields);
        
        const favoriteOwnerIds = new Set<string>();
        fields.forEach(field => {
            if (field.ownerId && favoriteComplexIds.has(field.complexId || field.id)) {
                favoriteOwnerIds.add(field.ownerId);
            }
        });

        return announcements.filter(announcement => favoriteOwnerIds.has(announcement.ownerId));
    }, [announcements, user, fields]);

    const featuredComplexes = complexes.slice(0, 4);

    return (
        <div className="space-y-10">
            {/* Hero Section */}
            <div className="relative h-[60vh] md:h-[50vh] flex items-start justify-center text-center text-white -mx-4 -mt-6 sm:-mt-8 overflow-hidden">
                <img
                    src="https://i.pinimg.com/736x/47/33/3e/47333e07ed4963aa120c821b597d0f8e.jpg"
                    alt="Campo de fútbol"
                    className="absolute inset-0 w-full h-full object-cover"
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                <div className="relative z-10 p-4 pt-12 md:pt-16">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
                        Tu Pasión, Tu Cancha
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-200">
                        La forma más fácil de jugar fútbol en tu ciudad.
                    </p>
                    {/* Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="mt-16 max-w-3xl mx-auto">
                        <div className="relative">
                            <SearchIcon className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500 z-10" />
                            <input
                                type="text"
                                placeholder="Busca por ciudad o nombre de cancha..."
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full py-4 pl-14 pr-36 border-0 rounded-full text-lg shadow-2xl transition-all duration-300 bg-white/90 dark:bg-gray-900/60 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:ring-2 focus:ring-[var(--color-primary-500)] dark:border dark:border-white/20"
                            />
                             <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--color-primary-600)] text-white font-bold py-3 px-8 rounded-full hover:bg-[var(--color-primary-700)] transition-all transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-gray-900"
                            >
                                Buscar
                            </button>
                        </div>
                    </form>
                    <button onClick={onSearchByLocation} disabled={isSearchingLocation} className="mt-4 flex items-center gap-2 mx-auto py-2 px-6 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-wait">
                        <LocationIcon className="w-5 h-5" />
                        {isSearchingLocation ? 'Buscando...' : 'Canchas cerca de mí'}
                    </button>
                </div>
            </div>

            <div className="space-y-12">
                {/* Announcements Section */}
                {filteredAnnouncements.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6">Noticias de tus Favoritos</h2>
                        <div className="space-y-4">
                            {filteredAnnouncements.map((item) => (
                                <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 flex items-center gap-4">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${item.type === 'offer' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'}`}>
                                        {item.type === 'offer' ? <SparklesIcon className="w-6 h-6" /> : <MegaphoneIcon className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-gray-100">{item.title} <span className="font-normal text-sm text-[var(--color-primary-600)]">@{item.complexName}</span></h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                

                {/* Categories Section */}
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6">Busca por Categoría</h2>
                     <div className="grid grid-cols-3 gap-4">
                        <CategoryButton icon={<img src="https://i.pinimg.com/736x/a5/7a/fa/a57afa6abeaeb64f8f2a1a0689e9a3f8.jpg" alt="Fútbol 5" className="h-12 w-12 rounded-lg"/>} label="Fútbol 5" onClick={() => handleCategorySearch('5v5')} />
                        <CategoryButton icon={<img src="https://i.pinimg.com/736x/ee/5b/8d/ee5b8d1fe632960104478b7c5b883c85.jpg" alt="Fútbol 7" className="h-12 w-12 rounded-lg"/>} label="Fútbol 7" onClick={() => handleCategorySearch('7v7')} />
                        <CategoryButton icon={<img src="https://i.pinimg.com/736x/7f/b7/3c/7fb73cf022f824a1443d5c9081cfe618.jpg" alt="Fútbol 11" className="h-12 w-12 rounded-lg"/>} label="Fútbol 11" onClick={() => handleCategorySearch('11v11')} />
                    </div>
                </div>

                {/* Featured Fields Section */}
                <div>
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{viewMode === 'list' ? 'Canchas Populares' : 'Explora las Canchas'}</h2>
                        {/* View Toggler */}
                        <div className="flex space-x-1 rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-2 rounded-md py-1.5 px-3 text-sm font-semibold leading-5 transition ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)]' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'}`}
                                aria-label="Vista de lista"
                            >
                                <ListIcon className="h-5 w-5" />
                                <span className="hidden sm:inline">Lista</span>
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`flex items-center gap-2 rounded-md py-1.5 px-3 text-sm font-semibold leading-5 transition ${viewMode === 'map' ? 'bg-white dark:bg-gray-800 shadow text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)]' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'}`}
                                aria-label="Vista de mapa"
                            >
                                <MapIcon className="h-5 w-5" />
                                <span className="hidden sm:inline">Mapa</span>
                            </button>
                        </div>
                    </div>
                    {loading ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(4)].map((_, i) => <FieldCardSkeleton key={i} />)}
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {featuredComplexes.map((fieldGroup, i) => {
                                const complexId = fieldGroup[0].complexId || fieldGroup[0].id;
                                return (
                                    <FieldCard 
                                        key={complexId} 
                                        fields={fieldGroup} 
                                        onSelect={onSelectField} 
                                        isFavorite={favoriteFields.includes(complexId)}
                                        onToggleFavorite={onToggleFavorite}
                                        onHover={setHoveredComplexId}
                                        isHighlighted={hoveredComplexId === complexId}
                                        className="animate-slide-in-up"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <MapView fields={fields} onSelectField={onSelectField} theme={theme} hoveredComplexId={hoveredComplexId} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;