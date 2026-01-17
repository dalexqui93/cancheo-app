
import React from 'react';
import type { Theme, AccentColor, AppBackgroundColor } from '../types';
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
    currentBgColor: AppBackgroundColor;
    onUpdateBgColor: (color: AppBackgroundColor) => void;
}

const ThemeOption: React.FC<{
    label: string;
    icon: React.ReactNode;
    isSelected: boolean;
    onClick: () => void;
}> = ({ label, icon, isSelected, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all w-full
            ${isSelected 
                ? 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/50 border-[var(--color-primary-600)] dark:border-[var(--color-primary-500)] text-[var(--color-primary-800)] dark:text-[var(--color-primary-300)]' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] dark:hover:border-[var(--color-primary-600)] dark:hover:text-[var(--color-primary-400)]'
            }`}
    >
        {icon}
        <span className="font-semibold">{label}</span>
    </button>
);

const AccentColorOption: React.FC<{
    color: AccentColor;
    isSelected: boolean;
    onClick: () => void;
}> = ({ color, isSelected, onClick }) => {
    const colorClasses: Record<AccentColor, string> = {
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        orange: 'bg-orange-500',
        purple: 'bg-purple-500',
    };
    return (
        <button
            onClick={onClick}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isSelected ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-[var(--color-primary-500)]' : ''}`}
            aria-label={`Color de acento ${color}`}
        >
            <div className={`w-10 h-10 rounded-full ${colorClasses[color]}`}></div>
        </button>
    );
};

const BgColorOption: React.FC<{
    colorId: AppBackgroundColor;
    label: string;
    lightHex: string;
    darkHex: string;
    isSelected: boolean;
    onClick: () => void;
}> = ({ colorId, label, lightHex, darkHex, isSelected, onClick }) => (
    <button 
        onClick={onClick}
        className={`group relative flex flex-col gap-2 p-3 rounded-2xl border-2 transition-all text-center
            ${isSelected 
                ? 'bg-white dark:bg-gray-800 border-brand shadow-md' 
                : 'bg-gray-50 dark:bg-gray-900/50 border-transparent hover:bg-white dark:hover:bg-gray-800'
            }`}
    >
        <div className="flex h-12 w-full rounded-xl overflow-hidden border border-borderDefault-light dark:border-borderDefault-dark">
            <div className="flex-1" style={{ backgroundColor: lightHex }}></div>
            <div className="flex-1" style={{ backgroundColor: darkHex }}></div>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-brand' : 'text-textMuted-light dark:text-textMuted-dark'}`}>
            {label}
        </span>
        {isSelected && <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand rounded-full flex items-center justify-center text-[8px] text-white">✓</div>}
    </button>
);


const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ currentTheme, onUpdateTheme, onBack, currentAccentColor, onUpdateAccentColor, currentBgColor, onUpdateBgColor }) => {
    return (
        <div className="container mx-auto px-4 py-6 sm:py-8 space-y-8 pb-[5.5rem] md:pb-4 animate-ios">
            <button onClick={onBack} className="flex items-center gap-2 text-brand font-black text-xs uppercase tracking-widest hover:opacity-70 transition-opacity">
                <ChevronLeftIcon className="h-4 w-4" />
                Volver
            </button>
            <h1 className="text-4xl font-black tracking-tighter text-textMain-light dark:text-textMain-dark uppercase italic">Apariencia</h1>
            
            <div className="space-y-6">
                {/* Tema */}
                <div className="bg-bgSurface-light dark:bg-bgSurface-dark p-6 rounded-4xl shadow-premium-light dark:shadow-premium-dark border border-borderDefault-light dark:border-borderDefault-dark">
                    <h2 className="text-lg font-black text-textMain-light dark:text-textMain-dark uppercase italic mb-1">Tema Visual</h2>
                    <p className="text-xs font-medium text-textMuted-light dark:text-textMuted-dark mb-6">Ajusta el brillo de la interfaz.</p>
                    <div className="grid grid-cols-3 gap-4">
                        <ThemeOption 
                            label="Claro"
                            icon={<SunIcon className="w-8 h-8"/>}
                            isSelected={currentTheme === 'light'}
                            onClick={() => onUpdateTheme('light')}
                        />
                        <ThemeOption 
                            label="Oscuro"
                            icon={<MoonIcon className="w-8 h-8"/>}
                            isSelected={currentTheme === 'dark'}
                            onClick={() => onUpdateTheme('dark')}
                        />
                        <ThemeOption 
                            label="Auto"
                            icon={<DesktopIcon className="w-8 h-8"/>}
                            isSelected={currentTheme === 'system'}
                            onClick={() => onUpdateTheme('system')}
                        />
                    </div>
                </div>

                {/* Color de Fondo */}
                <div className="bg-bgSurface-light dark:bg-bgSurface-dark p-6 rounded-4xl shadow-premium-light dark:shadow-premium-dark border border-borderDefault-light dark:border-borderDefault-dark">
                    <h2 className="text-lg font-black text-textMain-light dark:text-textMain-dark uppercase italic mb-1">Color de Fondo</h2>
                    <p className="text-xs font-medium text-textMuted-light dark:text-textMuted-dark mb-6">Elige el estilo de tu estadio personal.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <BgColorOption 
                            colorId="default"
                            label="Natural"
                            lightHex="#F7F9F8"
                            darkHex="#121212"
                            isSelected={currentBgColor === 'default'}
                            onClick={() => onUpdateBgColor('default')}
                        />
                        <BgColorOption 
                            colorId="turf"
                            label="Turf"
                            lightHex="#F0F7F2"
                            darkHex="#0A1A0F"
                            isSelected={currentBgColor === 'turf'}
                            onClick={() => onUpdateBgColor('turf')}
                        />
                        <BgColorOption 
                            colorId="midnight"
                            label="Noche"
                            lightHex="#F1F4F9"
                            darkHex="#0F172A"
                            isSelected={currentBgColor === 'midnight'}
                            onClick={() => onUpdateBgColor('midnight')}
                        />
                        <BgColorOption 
                            colorId="slate"
                            label="Técnico"
                            lightHex="#F2F4F7"
                            darkHex="#1A1C1E"
                            isSelected={currentBgColor === 'slate'}
                            onClick={() => onUpdateBgColor('slate')}
                        />
                    </div>
                </div>

                {/* Color de Acento */}
                <div className="bg-bgSurface-light dark:bg-bgSurface-dark p-6 rounded-4xl shadow-premium-light dark:shadow-premium-dark border border-borderDefault-light dark:border-borderDefault-dark text-center">
                    <h2 className="text-lg font-black text-textMain-light dark:text-textMain-dark uppercase italic mb-1">Acento</h2>
                    <p className="text-xs font-medium text-textMuted-light dark:text-textMuted-dark mb-6">Personaliza botones y enlaces.</p>
                    <div className="flex justify-center gap-6">
                        {(['green', 'blue', 'orange', 'purple'] as AccentColor[]).map(color => (
                            <AccentColorOption
                                key={color}
                                color={color}
                                isSelected={currentAccentColor === color}
                                onClick={() => onUpdateAccentColor(color)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppearanceSettings;
