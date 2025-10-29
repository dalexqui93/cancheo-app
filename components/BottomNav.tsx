import React from 'react';
import type { Tab } from '../types';

interface BottomNavProps {
    activeTab: Tab;
    onNavigate: (tab: Tab) => void;
}

const NavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
    const activeClass = isActive ? 'text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)]' : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-primary-600)] dark:hover:text-[var(--color-primary-500)]';
    const iconEffect = isActive ? 'transform scale-110' : '';
    
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-1 w-full transition-colors duration-200 ${activeClass}`}
            aria-label={label}
        >
            <div className={`transition-transform duration-200 ${iconEffect}`}>
                {icon}
            </div>
            <span className="text-xs font-bold">{label}</span>
        </button>
    );
};


const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onNavigate }) => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 z-50 md:hidden">
            <nav className="h-full container mx-auto px-4 flex justify-around items-center pt-1">
                <NavItem
                    label="Explorar"
                    icon={<img src="https://i.pinimg.com/736x/74/de/17/74de1778be11ca03d6932ce59347ed4a.jpg" alt="Explorar" className="h-8 w-8 rounded-full object-cover" />}
                    isActive={activeTab === 'explore'}
                    onClick={() => onNavigate('explore')}
                />
                <NavItem
                    label="Reservas"
                    icon={<img src="https://i.pinimg.com/736x/60/2f/c1/602fc1f2202be21b5797d8c8b3edeee0.jpg" alt="Reservas" className="h-8 w-8 rounded-full object-cover" />}
                    isActive={activeTab === 'bookings'}
                    onClick={() => onNavigate('bookings')}
                />
                <NavItem
                    label="Perfil"
                    icon={<img src="https://i.pinimg.com/736x/c4/4e/74/c44e74318c9f78671ac605ec8b0cce20.jpg" alt="Perfil" className="h-8 w-8 rounded-full object-cover" />}
                    isActive={activeTab === 'profile'}
                    onClick={() => onNavigate('profile')}
                />
            </nav>
        </footer>
    );
};

export default BottomNav;