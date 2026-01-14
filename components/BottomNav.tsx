import React from 'react';
import type { Tab } from '../types';

interface BottomNavProps {
    activeTab: Tab;
    onNavigate: (tab: Tab) => void;
}

// --- ICON FAMILY: PREMIUM SEMI-FILLED ---

const ExploreIcon = ({ active }: { active: boolean }) => (
    <svg viewBox="0 0 24 24" className={`w-6 h-6 transition-all duration-300 ${active ? 'text-brand' : 'text-slate-400'}`}>
        <path 
            fill={active ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" 
        />
        <path 
            fill={active ? 'white' : 'currentColor'} 
            d="M14.5 9.5L13 13l-3.5 1.5L11 11l3.5-1.5z" 
        />
    </svg>
);

const BookingsIcon = ({ active }: { active: boolean }) => (
    <svg viewBox="0 0 24 24" className={`w-6 h-6 transition-all duration-300 ${active ? 'text-brand' : 'text-slate-400'}`}>
        <rect 
            x="3" y="4" width="18" height="16" rx="3" 
            fill={active ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            strokeWidth="1.5" 
        />
        <path 
            d="M3 9h18M8 2v4M16 2v4" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
        />
        {active && <circle cx="12" cy="14.5" r="1.5" fill="white" />}
    </svg>
);

const ProfileIcon = ({ active }: { active: boolean }) => (
    <svg viewBox="0 0 24 24" className={`w-6 h-6 transition-all duration-300 ${active ? 'text-brand' : 'text-slate-400'}`}>
        <path 
            fill={active ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
            d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" 
        />
    </svg>
);

const DaviPlayIcon = () => (
    <svg viewBox="0 0 24 24" className="w-9 h-9 text-white">
        <path 
            fill="currentColor" 
            d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" 
        />
    </svg>
);

// --- COMPONENT ---

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onNavigate }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-2 pointer-events-none">
            <nav className="container mx-auto max-w-md h-[84px] glass-nav rounded-[38px] flex justify-between items-center px-8 shadow-premium shadow-nav-glow pointer-events-auto relative border border-white/10">
                
                {/* Left Group */}
                <div className="flex justify-between items-center w-[35%]">
                    <button
                        onClick={() => onNavigate('explore')}
                        className="flex flex-col items-center justify-center gap-1.5 active:scale-90 transition-all duration-200"
                    >
                        <div className={`${activeTab === 'explore' ? 'active-icon-anim' : ''}`}>
                            <ExploreIcon active={activeTab === 'explore'} />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${activeTab === 'explore' ? 'text-brand' : 'text-slate-500'}`}>Mapa</span>
                    </button>

                    <button
                        onClick={() => onNavigate('bookings')}
                        className="flex flex-col items-center justify-center gap-1.5 active:scale-90 transition-all duration-200"
                    >
                        <div className={`${activeTab === 'bookings' ? 'active-icon-anim' : ''}`}>
                            <BookingsIcon active={activeTab === 'bookings'} />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${activeTab === 'bookings' ? 'text-brand' : 'text-slate-500'}`}>Citas</span>
                    </button>
                </div>

                {/* DaviPlay Orbe Central */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-10 flex flex-col items-center">
                    <button
                        onClick={() => onNavigate('community')}
                        className={`w-[76px] h-[76px] rounded-full bg-gradient-to-tr from-brand via-primary-500 to-orange-400 flex items-center justify-center shadow-daviplay border-[5px] border-navBg transition-all active:scale-90 animate-daviplay ${activeTab === 'community' ? 'ring-4 ring-brand/20' : ''}`}
                    >
                        <DaviPlayIcon />
                    </button>
                    <span className={`mt-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'community' ? 'text-brand drop-shadow-[0_0_8px_rgba(255,100,82,0.4)]' : 'text-slate-500'}`}>
                        DaviPlay
                    </span>
                </div>

                {/* Right Group */}
                <div className="flex justify-end items-center w-[35%]">
                    <button
                        onClick={() => onNavigate('profile')}
                        className="flex flex-col items-center justify-center gap-1.5 active:scale-90 transition-all duration-200"
                    >
                        <div className={`${activeTab === 'profile' ? 'active-icon-anim' : ''}`}>
                            <ProfileIcon active={activeTab === 'profile'} />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${activeTab === 'profile' ? 'text-brand' : 'text-slate-500'}`}>Perfil</span>
                    </button>
                </div>

                {/* iOS Indicator Visual Mimic */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/5 rounded-full"></div>
            </nav>
        </div>
    );
};

export default BottomNav;