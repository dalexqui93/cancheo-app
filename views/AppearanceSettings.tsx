import React from 'react';
import type { Theme, AccentColor } from '../types';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { SunIcon } from '../components/icons/SunIcon';
import { MoonIcon } from '../components/icons/MoonIcon';
import { DesktopIcon } from '../components/icons/DesktopIcon';

interface AppearanceSettingsProps {
    currentTheme: Theme;
    onUpdateTheme: (theme: Theme) => void;
    onBack: () => void;
    currentAccentColor: AccentColor;
    onUpdateAccentColor: (color: AccentColor) => void;
}

const ThemeCard: React.FC<{
    label: string;
    description: string;
    icon: React.ReactNode;
    isSelected: boolean;
    onClick: () => void;
}> = ({ label, description, icon, isSelected, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-4 p-5 rounded-[28px] border-2 transition-all w-full text-left group active:scale-[0.98] ${
            isSelected 
                ? 'bg-brand/5 border-brand ring-4 ring-brand/10 shadow-lg' 
                : 'bg-white dark:bg-navBg/50 border-gray-100 dark:border-white/5 hover:border-brand/30 shadow-sm'
        }`}
    >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            isSelected ? 'bg-brand text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-400 group-hover:text-brand'
        }`}>
            {icon}
        </div>
        <div className="flex-grow">
            <p className={`font-bold text-lg ${isSelected ? 'text-brand dark:text-white' : 'text-textMain dark:text-gray-200'}`}>{label}</p>
            <p className="text-xs text-textMuted font-medium">{description}</p>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            isSelected ? 'border-brand bg-brand' : 'border-gray-200 dark:border-white/10'
        }`}>
            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
        </div>
    </button>
);

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ currentTheme, onUpdateTheme, onBack, currentAccentColor, onUpdateAccentColor }) => {
    return (
        <div className="container mx-auto max-w-lg px-4 py-6 space-y-8 pb-32 animate-ios">
            <button 
                onClick={onBack} 
                className="flex items-center gap-2 text-brand font-black text-sm uppercase tracking-widest hover:opacity-70 transition-opacity"
            >
                <ChevronLeftIcon className="h-5 w-5" />
                Regresar
            </button>

            <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tighter text-textMain dark:text-white uppercase italic">Apariencia</h1>
                <p className="text-textMuted font-medium">Personaliza tu experiencia visual en Cancheo.</p>
            </div>
            
            <div className="space-y-4">
                <h2 className="text-xs font-black text-textMuted uppercase tracking-[0.2em] ml-2">Tema del Sistema</h2>
                <div className="space-y-3">
                    <ThemeCard 
                        label="Modo Claro"
                        description="Ideal para ambientes con mucha luz."
                        icon={<SunIcon className="w-7 h-7"/>}
                        isSelected={currentTheme === 'light'}
                        onClick={() => onUpdateTheme('light')}
                    />
                    <ThemeCard 
                        label="Modo Oscuro"
                        description="Elegante y amable con tu vista."
                        icon={<MoonIcon className="w-7 h-7"/>}
                        isSelected={currentTheme === 'dark'}
                        onClick={() => onUpdateTheme('dark')}
                    />
                    <ThemeCard 
                        label="Sistema"
                        description="Se adapta automáticamente a tu equipo."
                        icon={<DesktopIcon className="w-7 h-7"/>}
                        isSelected={currentTheme === 'system'}
                        onClick={() => onUpdateTheme('system')}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-navBg p-8 rounded-[40px] shadow-premium border border-white dark:border-white/5 space-y-6">
                <div className="space-y-1 text-center">
                    <h2 className="text-xl font-black text-textMain dark:text-white tracking-tight uppercase italic">Color de Acento</h2>
                    <p className="text-xs text-textMuted font-medium">Define el color de los botones e interacción.</p>
                </div>
                
                <div className="flex justify-center gap-6">
                    {(['green', 'blue', 'orange', 'purple'] as AccentColor[]).map(color => {
                        const colorClasses: Record<AccentColor, string> = {
                            green: 'bg-emerald-500',
                            blue: 'bg-blue-500',
                            orange: 'bg-brand',
                            purple: 'bg-violet-500',
                        };
                        const isSelected = currentAccentColor === color;
                        return (
                            <button
                                key={color}
                                onClick={() => onUpdateAccentColor(color)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                    isSelected 
                                    ? 'ring-4 ring-offset-4 dark:ring-offset-bgMain ring-brand scale-110' 
                                    : 'hover:scale-105'
                                }`}
                                aria-label={`Color ${color}`}
                            >
                                <div className={`w-full h-full rounded-full ${colorClasses[color]} shadow-lg`}></div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-6 bg-brand/10 rounded-3xl border border-brand/20">
                <p className="text-xs text-brand font-bold text-center italic">
                    Nota: La sección DaviPlay mantiene siempre su estética oscura premium para una mejor inmersión competitiva.
                </p>
            </div>
        </div>
    );
};

export default AppearanceSettings;