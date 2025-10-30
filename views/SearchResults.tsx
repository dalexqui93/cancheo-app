import React, { useState, useMemo } from 'react';
import type { SoccerField, Theme } from '../types';
import FieldCard from '../components/FieldCard';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { FilterIcon } from '../components/icons/FilterIcon';
import { XIcon } from '../components/icons/XIcon';
import { MapIcon } from '../components/icons/MapIcon';
import { ListIcon } from '../components/icons/ListIcon';
import MapView from './MapView';
import FieldCardSkeleton from '../components/FieldCardSkeleton';


interface SearchResultsProps {
    fields: SoccerField[];
    onSelectField: (field: SoccerField) => void;
    onBack: () => void;
    favoriteFields: string[];
    onToggleFavorite: (complexId: string) => void;
    theme: Theme;
    loading?: boolean;
}

interface Filters {
    maxPrice: string;
    sizes: ('5v5' | '7v7' | '11v11')[];
    services: string[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ fields, onSelectField, onBack, favoriteFields, onToggleFavorite, theme, loading = false }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        maxPrice: '',
        sizes: [],
        services: [],
    });
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [hoveredComplexId, setHoveredComplexId] = useState<string | null>(null);

    const availableServices = useMemo(() => {
        const allServices = fields.flatMap(field => field.services.map(s => s.name));
        return [...new Set(allServices)].sort();
    }, [fields]);

    const handleSizeChange = (size: '5v5' | '7v7' | '11v11') => {
        setFilters(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size]
        }));
    };

    const handleServiceChange = (serviceName: string) => {
        setFilters(prev => ({
            ...prev,
            services: prev.services.includes(serviceName)
                ? prev.services.filter(s => s !== serviceName)
                : [...prev.services, serviceName]
        }));
    };

    const clearFilters = () => {
        setFilters({ maxPrice: '', sizes: [], services: [] });
    };

    const filteredFields = useMemo(() => {
        return fields.filter(field => {
            const maxPrice = parseFloat(filters.maxPrice);
            const priceMatch = isNaN(maxPrice) || field.pricePerHour <= maxPrice;
            const sizeMatch = filters.sizes.length === 0 || filters.sizes.includes(field.size);
            const servicesMatch = filters.services.every(serviceName =>
                field.services.some(s => s.name === serviceName)
            );
            return priceMatch && sizeMatch && servicesMatch;
        });
    }, [fields, filters]);

    const complexes = useMemo(() => {
        const grouped: { [key: string]: SoccerField[] } = {};
        filteredFields.forEach(field => {
            const id = field.complexId || field.id;
            if (!grouped[id]) grouped[id] = [];
            grouped[id].push(field);
        });
        return Object.values(grouped);
    }, [filteredFields]);
    
    const activeFilterCount = (filters.maxPrice ? 1 : 0) + filters.sizes.length + filters.services.length;


    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] font-semibold mb-6 hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver
            </button>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Resultados</h1>
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* View Toggler */}
                    <div className="flex space-x-1 rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`rounded-md p-2 text-sm font-semibold leading-5 transition ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)]' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'}`}
                            aria-label="Vista de lista"
                        >
                            <ListIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`rounded-md p-2 text-sm font-semibold leading-5 transition ${viewMode === 'map' ? 'bg-white dark:bg-gray-800 shadow text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)]' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'}`}
                            aria-label="Vista de mapa"
                        >
                            <MapIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 py-2 px-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition relative"
                    >
                        <FilterIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        <span className="font-semibold text-gray-700 dark:text-gray-200 hidden sm:inline">Filtros</span>
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--color-primary-600)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
            
            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${showFilters ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Filtros Avanzados</h2>
                             <button onClick={clearFilters} className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] hover:text-[var(--color-primary-700)] dark:hover:text-[var(--color-primary-400)] py-2 px-3 rounded-lg transition-colors hover:bg-[var(--color-primary-50)] dark:hover:bg-[var(--color-primary-900)]/30">
                                <XIcon className="h-4 w-4" />
                                <span>Limpiar filtros</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Price Filter */}
                            <div>
                                <label htmlFor="max-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio Máximo (/hora)</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">$</span>
                                    <input
                                        id="max-price"
                                        type="number"
                                        placeholder="100000"
                                        value={filters.maxPrice}
                                        onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                                        className="w-full pl-7 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-white dark:bg-gray-700"
                                    />
                                </div>
                            </div>
                            {/* Size Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tamaño de Cancha</label>
                                <div className="flex gap-2">
                                    {(['5v5', '7v7', '11v11'] as const).map(size => (
                                        <button
                                            key={size}
                                            onClick={() => handleSizeChange(size)}
                                            className={`py-2 px-4 rounded-md text-sm font-semibold transition flex-grow ${filters.sizes.includes(size) ? 'bg-[var(--color-primary-600)] text-white shadow' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                             {/* Services Filter */}
                            <div>
                                <fieldset>
                                    <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Servicios Incluidos</legend>
                                    <div className="flex flex-wrap gap-2">
                                        {availableServices.map(service => (
                                            <div key={service}>
                                                <input
                                                    type="checkbox"
                                                    id={`service-${service}`}
                                                    value={service}
                                                    checked={filters.services.includes(service)}
                                                    onChange={() => handleServiceChange(service)}
                                                    className="sr-only peer"
                                                />
                                                <label
                                                    htmlFor={`service-${service}`}
                                                    className="py-1 px-3 rounded-full text-xs font-semibold transition border cursor-pointer bg-white text-gray-600 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 peer-checked:bg-[var(--color-primary-100)] peer-checked:text-[var(--color-primary-800)] peer-checked:border-[var(--color-primary-300)] dark:peer-checked:bg-[var(--color-primary-900)]/50 dark:peer-checked:text-[var(--color-primary-300)] dark:peer-checked:border-[var(--color-primary-700)]"
                                                >
                                                   {service}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </fieldset>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {!loading && <p className="text-gray-600 dark:text-gray-400 mb-6">Encontramos {complexes.length} complejo{complexes.length !== 1 && 's'} para ti.</p>}
            
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(6)].map((_, i) => <FieldCardSkeleton key={i} />)}
                </div>
            ) : complexes.length > 0 ? (
                viewMode === 'list' ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {complexes.map((fieldGroup, i) => {
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
                    <MapView fields={filteredFields} onSelectField={onSelectField} theme={theme} hoveredComplexId={hoveredComplexId} />
                )
            ) : (
                <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:border dark:border-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 9.75l-3.75 3.75" />
                    </svg>
                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">No se encontraron canchas</h2>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-400">Intenta con otra ubicación o ajusta tus filtros.</p>
                </div>
            )}
        </div>
    );
};

export default SearchResults;