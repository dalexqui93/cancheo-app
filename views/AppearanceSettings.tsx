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


const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ currentTheme, onUpdateTheme, onBack, currentAccentColor, onUpdateAccentColor }) => {
    return (
        <div className="container mx-auto px-4 py-6 sm:py-8 space-y-8 pb-[5.5rem] md:pb-4">
            <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] font-semibold hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver al Perfil
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Apariencia</h1>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Tema de la Aplicación</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Elige cómo quieres que se vea la aplicación en tu dispositivo.
                </p>
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
                        label="Sistema"
                        icon={<DesktopIcon className="w-8 h-8"/>}
                        isSelected={currentTheme === 'system'}
                        onClick={() => onUpdateTheme('system')}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Color de Acento</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Personaliza el color principal de los botones y enlaces.
                </p>
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
    );
};

export default AppearanceSettings;