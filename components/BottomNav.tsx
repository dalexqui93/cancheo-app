import React from 'react';
import type { Tab } from '../types';

interface BottomNavProps {
    activeTab: Tab;
    onNavigate: (tab: Tab) => void;
}

const NavItem: React.FC<{
    label: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 w-full transition-all duration-300 ${
            isActive ? 'text-brand' : 'text-gray-400 hover:text-gray-600'
        }`}
    >
        <div className={`w-6 h-6 rounded-full overflow-hidden transition-transform ${isActive ? 'scale-110' : 'grayscale opacity-70'}`}>
            <img src={icon} alt={label} className="w-full h-full object-cover" />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-60'}`}>
            {label}
        </span>
    </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onNavigate }) => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 pointer-events-none">
            <nav className="container mx-auto max-w-md h-16 glass-nav border border-gray-100 rounded-full flex justify-around items-center px-4 shadow-premium pointer-events-auto">
                <NavItem
                    label="Explorar"
                    icon="https://i.pinimg.com/736x/74/de/17/74de1778be11ca03d6932ce59347ed4a.jpg"
                    isActive={activeTab === 'explore'}
                    onClick={() => onNavigate('explore')}
                />
                <NavItem
                    label="DaviPlay"
                    icon="https://i.pinimg.com/736x/fc/70/cd/fc70cde92e1cc66379b0b8882ea4665a.jpg"
                    isActive={activeTab === 'community'}
                    onClick={() => onNavigate('community')}
                />
                <NavItem
                    label="Reservas"
                    icon="https://i.pinimg.com/736x/60/2f/c1/602fc1f2202be21b5797d8c8b3edeee0.jpg"
                    isActive={activeTab === 'bookings'}
                    onClick={() => onNavigate('bookings')}
                />
                <NavItem
                    label="Perfil"
                    icon="https://i.pinimg.com/736x/c4/4e/74/c44e74318c9f78671ac605ec8b0cce20.jpg"
                    isActive={activeTab === 'profile'}
                    onClick={() => onNavigate('profile')}
                />
            </nav>
        </footer>
    );
};

export default BottomNav;