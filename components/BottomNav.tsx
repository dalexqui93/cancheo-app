import React from 'react';
import type { Tab } from '../types';

interface BottomNavProps {
    activeTab: Tab;
    onNavigate: (tab: Tab) => void;
}

const BookingsIcon = ({ active }: { active: boolean }) => (
    <svg viewBox="0 0 24 24" className={`w-5 h-5 transition-all duration-300 ${active ? 'text-brand' : 'text-textMuted-light dark:text-textMuted-dark'}`}>
        <rect 
            x="3" y="4" width="18" height="16" rx="3" 
            fill={active ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            strokeWidth="2" 
        />
        <path 
            d="M3 9h18M8 2v4M16 2v4" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
        />
    </svg>
);

const ProfileIcon = ({ active }: { active: boolean }) => (
    <svg viewBox="0 0 24 24" className={`w-5 h-5 transition-all duration-300 ${active ? 'text-brand' : 'text-textMuted-light dark:text-textMuted-dark'}`}>
        <path 
            fill={active ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
            d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" 
        />
    </svg>
);

const DaviPlayIcon = () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7 text-white">
        <path 
            fill="currentColor" 
            d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" 
        />
    </svg>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onNavigate }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] px-6 pb-6 pointer-events-none safe-area-bottom">
            <nav className="container mx-auto max-w-sm h-[68px] glass-nav bg-bgSurface-light/95 dark:bg-bgSurface-dark/95 rounded-[32px] flex justify-between items-center px-8 shadow-nav-light dark:shadow-nav-dark border border-borderDefault-light dark:border-borderDefault-dark pointer-events-auto relative transition-colors duration-300">
                
                {/* Left Group - Citas */}
                <div className="flex-1 flex justify-center">
                    <button
                        onClick={() => onNavigate('bookings')}
                        className="flex flex-col items-center justify-center gap-1 active:scale-90 transition-all duration-200"
                    >
                        <BookingsIcon active={activeTab === 'bookings'} />
                        <span className={`text-[8px] font-black uppercase tracking-[0.15em] transition-colors ${activeTab === 'bookings' ? 'text-brand' : 'text-textMuted-light dark:text-textMuted-dark'}`}>Citas</span>
                    </button>
                </div>

                {/* DaviPlay Botón Central */}
                <div className="relative w-16 flex flex-col items-center">
                    <button
                        onClick={() => onNavigate('community')}
                        className={`absolute -top-8 w-14 h-14 rounded-2xl bg-brand flex items-center justify-center shadow-daviplay border-[4px] border-bgSurface-light dark:border-bgSurface-dark transition-all active:scale-90 animate-daviplay ${activeTab === 'community' ? 'ring-4 ring-brand/10' : ''}`}
                    >
                        <DaviPlayIcon />
                    </button>
                    <span className={`mt-8 text-[8px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'community' ? 'text-brand' : 'text-textMuted-light dark:text-textMuted-dark'}`}>
                        DaviPlay
                    </span>
                </div>

                {/* Right Group - Perfil */}
                <div className="flex-1 flex justify-center">
                    <button
                        onClick={() => onNavigate('profile')}
                        className="flex flex-col items-center justify-center gap-1 active:scale-90 transition-all duration-200"
                    >
                        <ProfileIcon active={activeTab === 'profile'} />
                        <span className={`text-[8px] font-black uppercase tracking-[0.15em] transition-colors ${activeTab === 'profile' ? 'text-brand' : 'text-textMuted-light dark:text-textMuted-dark'}`}>Perfil</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default BottomNav;
