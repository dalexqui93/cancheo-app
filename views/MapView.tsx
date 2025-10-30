import React, { useEffect, useRef } from 'react';
import type { SoccerField, Theme } from '../types';

// Since we are using the global 'L' from the script tag in index.html, we need to declare it to satisfy TypeScript.
declare const L: any;

interface MapViewProps {
    fields: SoccerField[];
    onSelectField: (field: SoccerField) => void;
    className?: string;
    theme: Theme;
}

const MapView: React.FC<MapViewProps> = ({ fields, onSelectField, className = '', theme }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const tileLayerRef = useRef<any>(null);

    // Effect for initializing and updating markers
    useEffect(() => {
        if (!mapContainerRef.current || typeof L === 'undefined') return;

        // Initialize map only once
        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView([4.6097, -74.0817], 6); // Center on Colombia

            tileLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }).addTo(mapRef.current);
            
            // Use a single event listener on the map for all popups
            mapRef.current.on('popupopen', (e: any) => {
                const button = e.popup._container.querySelector('.popup-details-button');
                if (button) {
                    button.onclick = () => {
                        const fieldId = button.getAttribute('data-field-id');
                        const selectedField = fields.find(f => f.id === fieldId);
                        if (selectedField) {
                            onSelectField(selectedField);
                        }
                    };
                }
            });
        }

        const map = mapRef.current;

        // Clear existing markers
        markersRef.current.forEach(marker => map.removeLayer(marker));
        markersRef.current = [];

        if (fields.length === 0) {
            map.setView([4.6097, -74.0817], 6);
            return;
        }

        const bounds = L.latLngBounds([]);

        fields.forEach(field => {
            const marker = L.marker([field.latitude, field.longitude]).addTo(map);
            
            const popupContent = `
                <div>
                    <img src="${field.images[0]}" alt="${field.name}" class="popup-image" />
                    <div class="popup-info">
                        <h3 class="popup-title">${field.name}</h3>
                        <p class="popup-city">${field.city}</p>
                        <button data-field-id="${field.id}" class="popup-details-button">
                            Ver Detalles
                        </button>
                    </div>
                </div>
            `;
            marker.bindPopup(popupContent, { minWidth: 220 });
            markersRef.current.push(marker);
            bounds.extend([field.latitude, field.longitude]);
        });

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }

        // Invalidate size to ensure map is rendered correctly
        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
        });
        if(mapContainerRef.current){
             resizeObserver.observe(mapContainerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };

    }, [fields, onSelectField]);

    // Effect for handling theme changes
    useEffect(() => {
        if (!tileLayerRef.current) return;
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const updateTileLayer = () => {
            const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
            
            // Use CARTO tiles for both light and dark themes to comply with usage policies.
            const newUrl = isDark
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
            
            const newAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

            if (tileLayerRef.current._url !== newUrl) {
                tileLayerRef.current.setUrl(newUrl);
                tileLayerRef.current.options.attribution = newAttribution;
                // Force redraw of attribution control
                if (mapRef.current.attributionControl) {
                    mapRef.current.attributionControl.setPrefix(false);
                }
            }
        };

        updateTileLayer(); // Initial update based on theme prop

        mediaQuery.addEventListener('change', updateTileLayer);
        return () => mediaQuery.removeEventListener('change', updateTileLayer);
    }, [theme]);


    return <div ref={mapContainerRef} className={`w-full h-[500px] md:h-[600px] rounded-2xl shadow-md dark:shadow-none overflow-hidden z-0 ${className}`} />;
};

export default MapView;