import React, { useEffect, useRef, useMemo } from 'react';
import type { SoccerField, Theme } from '../types';

// Since we are using the global 'L' from the script tag in index.html, we need to declare it to satisfy TypeScript.
declare const L: any;

interface MapViewProps {
    fields: SoccerField[];
    onSelectField: (field: SoccerField) => void;
    className?: string;
    theme: Theme;
    hoveredComplexId?: string | null;
}

const MapView: React.FC<MapViewProps> = ({ fields, onSelectField, className = '', theme, hoveredComplexId }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<{ [key: string]: any }>({});
    const tileLayerRef = useRef<any>(null);

    const complexes = useMemo(() => {
        const grouped: { [key: string]: SoccerField } = {};
        fields.forEach(field => {
            const id = field.complexId || field.id;
            if (!grouped[id]) {
                grouped[id] = field; // Store the first field as representative for the complex
            }
        });
        return Object.values(grouped);
    }, [fields]);


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
        Object.values(markersRef.current).forEach(marker => map.removeLayer(marker));
        markersRef.current = {};

        if (complexes.length === 0) {
            map.setView([4.6097, -74.0817], 6);
            return;
        }

        const bounds = L.latLngBounds([]);

        complexes.forEach(field => {
            const complexId = field.complexId || field.id;
            const complexName = field.name.split(' - ')[0] || field.name;
            const marker = L.marker([field.latitude, field.longitude]).addTo(map);
            
            const popupContent = `
                <div>
                    <img src="${field.images[0]}" alt="${complexName}" class="popup-image" />
                    <div class="popup-info">
                        <h3 class="popup-title">${complexName}</h3>
                        <p class="popup-city">${field.city}</p>
                        <button data-field-id="${field.id}" class="popup-details-button">
                            Ver Detalles
                        </button>
                    </div>
                </div>
            `;
            marker.bindPopup(popupContent, { minWidth: 220 });
            markersRef.current[complexId] = marker;
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

    }, [complexes, onSelectField, fields]);

    // Effect for handling theme changes
    useEffect(() => {
        if (!tileLayerRef.current) return;
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const updateTileLayer = () => {
            const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
            
            const newUrl = isDark
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
            
            const newAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

            if (tileLayerRef.current._url !== newUrl) {
                tileLayerRef.current.setUrl(newUrl);
                tileLayerRef.current.options.attribution = newAttribution;
                if (mapRef.current.attributionControl) {
                    mapRef.current.attributionControl.setPrefix(false);
                }
            }
        };

        updateTileLayer();

        mediaQuery.addEventListener('change', updateTileLayer);
        return () => mediaQuery.removeEventListener('change', updateTileLayer);
    }, [theme]);
    
    // Effect for highlighting hovered field from list
    useEffect(() => {
        if (mapRef.current && hoveredComplexId && markersRef.current[hoveredComplexId]) {
            const marker = markersRef.current[hoveredComplexId];
            if (!marker.isPopupOpen()) {
                mapRef.current.flyTo(marker.getLatLng(), 16, {
                    animate: true,
                    duration: 0.5
                });
                marker.openPopup();
            }
        }
    }, [hoveredComplexId]);


    return <div ref={mapContainerRef} className={`w-full h-[500px] md:h-[600px] rounded-2xl shadow-md dark:shadow-none overflow-hidden z-0 ${className}`} />;
};

export default MapView;