import React, { useState, useEffect, useCallback } from 'react';
import type { SoccerField, User, Notification, ConfirmedBooking, Tab, Theme, AccentColor, WeatherData, SocialSection, Team, Invitation, Player } from '../types';
import { View } from '../types';
import Header from '../components/Header';
import Home from '../views/Home';
import SearchResults from '../views/SearchResults';
import FieldDetail from '../views/FieldDetail';
import Booking from '../views/Booking';
import BookingConfirmation from '../views/BookingConfirmation';
import Login from '../views/Login';
import Register from '../views/Register';
import OwnerDashboard from '../views/AdminDashboard';
import ProfileView from '../views/ProfileView';
import BookingsView from '../views/BookingsView';
import BookingDetailView from '../views/BookingDetailView';
import NotificationContainer from '../components/NotificationContainer';
import BottomNav from '../components/BottomNav';
import AppearanceSettings from '../views/AppearanceSettings';
import HelpView from '../views/HelpView';
import SocialView from '../views/SocialView';
import PaymentMethodsView from '../views/PaymentMethodsView';
import PlayerProfileCreatorView from '../views/player_profile/PlayerProfileCreatorView';
import PremiumLockModal from '../components/PremiumLockModal';
import ForgotPasswordView from '../views/ForgotPassword';
import * as db from '../database';
import { isFirebaseConfigured } from '../database';

const App = () => {
    const [fields, setFields] = useState<SoccerField[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allBookings, setAllBookings] = useState<ConfirmedBooking[]>([]);
    const [allTeams, setAllTeams] = useState<Team[]>([]);
    const [view, setView] = useState<View>(View.HOME);
    const [activeTab, setActiveTab] = useState<Tab>('explore');
    const [user, setUser] = useState<User | null>(null);
    const [selectedField, setSelectedField] = useState<SoccerField | null>(null);
    const [searchResults, setSearchResults] = useState<SoccerField[]>([]);
    const [toasts, setToasts] = useState<Notification[]>([]);
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
    const [accentColor, setAccentColor] = useState<AccentColor>(() => (localStorage.getItem('accentColor') as AccentColor) || 'green');
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState<boolean>(false);
    const [socialSection, setSocialSection] = useState<SocialSection>('hub');
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);
    const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
    const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([]);

    // Lógica de Temas Unificada y Persistente
    useEffect(() => {
        const root = window.document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const updateTheme = () => {
            const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
            root.classList.toggle('dark', isDark);
            root.classList.toggle('light', !isDark);
            localStorage.setItem('theme', theme);
        };

        updateTheme();
        mediaQuery.addEventListener('change', updateTheme);
        return () => mediaQuery.removeEventListener('change', updateTheme);
    }, [theme]);

    useEffect(() => {
        const loadInitialData = async () => {
            if (isFirebaseConfigured) await db.seedDatabase();
            const [fieldsData, usersData, bookingsData, teamsData] = await Promise.all([
                db.getFields(),
                db.getUsers(),
                db.getAllBookings(),
                db.getTeams(),
            ]);
            setFields(fieldsData);
            setAllUsers(usersData);
            setAllBookings(bookingsData);
            setAllTeams(teamsData);
        };
        loadInitialData();
    }, []);

    // Listeners para datos en tiempo real si Firebase está configurado
    useEffect(() => {
        if (!isFirebaseConfigured) return;
        const unsubUsers = db.listenToAllUsers(setAllUsers);
        const unsubTeams = db.listenToAllTeams(setAllTeams);
        const unsubBookings = db.listenToAllBookings(setAllBookings);
        return () => {
            unsubUsers();
            unsubTeams();
            unsubBookings();
        };
    }, []);

    // Listener para invitaciones
    useEffect(() => {
        if (!user) return;
        const unsubRec = db.listenToInvitationsForUser(user.id, setReceivedInvitations);
        const unsubSent = db.listenToInvitationsByTeams(user.teamIds || [], setSentInvitations);
        return () => {
            unsubRec();
            unsubSent();
        };
    }, [user]);

    const handleNavigate = (newView: View) => {
        setView(newView);
        window.scrollTo(0, 0);
        if ([View.HOME, View.SEARCH_RESULTS, View.FIELD_DETAIL].includes(newView)) setActiveTab('explore');
        else if ([View.BOOKINGS, View.BOOKING_DETAIL].includes(newView)) setActiveTab('bookings');
        else if ([View.SOCIAL].includes(newView)) setActiveTab('community');
        else if ([View.PROFILE].includes(newView)) setActiveTab('profile');
    };

    const handleTabNavigate = (tab: Tab) => {
        setActiveTab(tab);
        if (!user && tab !== 'explore') {
            setView(View.LOGIN);
            return;
        }
        switch (tab) {
            case 'explore': setView(View.HOME); break;
            case 'community': setView(View.SOCIAL); setSocialSection('hub'); break;
            case 'bookings': setView(View.BOOKINGS); break;
            case 'profile': setView(View.PROFILE); break;
        }
    };

    const handleLogin = (email: string, password: string) => {
        const loggedInUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (loggedInUser && loggedInUser.password === password) {
            setUser(loggedInUser);
            handleNavigate(View.HOME);
        } else {
            setToasts(prev => [...prev, { id: Date.now(), type: 'error', title: 'Error de acceso', message: 'Credenciales inválidas', timestamp: new Date() }]);
        }
    };

    const handleLogout = () => {
        setUser(null);
        setView(View.HOME);
        setActiveTab('explore');
    };

    const handleUpdateUserTeams = async (teamIds: string[]) => {
        if (!user) return;
        await db.updateUser(user.id, { teamIds });
        setUser(prev => prev ? { ...prev, teamIds } : null);
    };

    const handleUpdateTeam = async (teamId: string, updates: Partial<Team>) => {
        await db.updateTeam(teamId, updates);
        setAllTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...updates } : t));
    };

    const handleSendInvitation = async (team: Team, player: Player) => {
        if (!user) return;
        await db.addInvitation({
            teamId: team.id,
            teamName: team.name,
            teamLogo: team.logo,
            fromUserId: user.id,
            fromUserName: user.name,
            toUserId: player.id,
            toUserName: player.name,
            timestamp: new Date()
        });
        setToasts(prev => [...prev, { id: Date.now(), type: 'success', title: 'Invitación Enviada', message: `Has invitado a ${player.name} a ${team.name}`, timestamp: new Date() }]);
    };

    const handleAcceptInvitation = async (invitation: Invitation) => {
        if (!user) return;
        const team = allTeams.find(t => t.id === invitation.teamId);
        if (!team) return;
        
        const newTeamIds = [...(user.teamIds || []), team.id];
        const newPlayers = [...team.players, user.playerProfile || { id: user.id, name: user.name, position: 'Cualquiera', level: 'Casual', stats: { matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 } }];
        
        await Promise.all([
            db.updateUser(user.id, { teamIds: newTeamIds }),
            db.updateTeam(team.id, { players: newPlayers }),
            db.deleteInvitation(invitation.id)
        ]);
        
        setUser(prev => prev ? { ...prev, teamIds: newTeamIds } : null);
        setToasts(prev => [...prev, { id: Date.now(), type: 'success', title: '¡Bienvenido!', message: `Te has unido a ${team.name}`, timestamp: new Date() }]);
    };

    const handleRejectInvitation = async (invitation: Invitation) => {
        await db.deleteInvitation(invitation.id);
    };

    const handleSetAvailability = async (isAvailable: boolean, note?: string) => {
        if (!user || !user.playerProfile) return;
        const updatedProfile = { ...user.playerProfile, isAvailableToday: isAvailable, availabilityNote: note };
        await db.updateUser(user.id, { playerProfile: updatedProfile });
        setUser(prev => prev ? { ...prev, playerProfile: updatedProfile } : null);
    };

    const handleRemovePlayerFromTeam = async (teamId: string, playerId: string) => {
        const team = allTeams.find(t => t.id === teamId);
        if (!team) return;
        const newPlayers = team.players.filter(p => p.id !== playerId);
        await db.updateTeam(teamId, { players: newPlayers });
        
        // También actualizar el array teamIds del usuario expulsado
        const targetUser = allUsers.find(u => u.id === playerId);
        if (targetUser) {
            const newIds = (targetUser.teamIds || []).filter(id => id !== teamId);
            await db.updateUser(playerId, { teamIds: newIds });
        }
    };

    const handleLeaveTeam = async (teamId: string) => {
        if (!user) return;
        await handleRemovePlayerFromTeam(teamId, user.id);
        const newIds = (user.teamIds || []).filter(id => id !== teamId);
        setUser(prev => prev ? { ...prev, teamIds: newIds } : null);
    };

    const handleSavePlayerProfile = async (profile: Player) => {
        if (!user) return;
        await db.updateUser(user.id, { playerProfile: profile });
        setUser(prev => prev ? { ...prev, playerProfile: profile } : null);
        handleNavigate(View.SOCIAL);
        setToasts(prev => [...prev, { id: Date.now(), type: 'success', title: 'Perfil Guardado', message: 'Tu perfil de jugador ha sido actualizado.', timestamp: new Date() }]);
    };

    const renderView = () => {
        if (!user && ![View.HOME, View.SEARCH_RESULTS, View.FIELD_DETAIL, View.LOGIN, View.REGISTER, View.FORGOT_PASSWORD].includes(view)) {
            return <Login onLogin={handleLogin} onNavigateToHome={() => handleNavigate(View.HOME)} onNavigate={handleNavigate} />;
        }

        const commonProps = {
            user: user!,
            allTeams,
            allUsers,
            allBookings,
            addNotification: (n: any) => setToasts(prev => [...prev, { ...n, id: Date.now(), timestamp: new Date() }]),
            onNavigate: handleNavigate,
            setIsPremiumModalOpen,
            weatherData
        };

        switch (view) {
            case View.HOME:
                return <Home onSearch={(loc) => {}} onSelectField={(f) => { setSelectedField(f); setView(View.FIELD_DETAIL); }} fields={fields} loading={false} favoriteFields={user?.favoriteFields || []} onToggleFavorite={(id) => {}} user={user} onSearchByLocation={() => {}} isSearchingLocation={false} weatherData={weatherData} isWeatherLoading={isWeatherLoading} onRefreshWeather={() => {}} allBookings={allBookings} allTeams={allTeams} currentTime={new Date()} acceptedMatches={[]} onSelectBooking={() => {}} />;
            case View.SOCIAL:
                return <SocialView {...commonProps} section={socialSection} setSection={setSocialSection} onUpdateUserTeams={handleUpdateUserTeams} onUpdateTeam={handleUpdateTeam} sentInvitations={sentInvitations} onSendInvitation={handleSendInvitation} onCancelInvitation={db.deleteInvitation} onRemovePlayerFromTeam={handleRemovePlayerFromTeam} onLeaveTeam={handleLeaveTeam} onSetAvailability={handleSetAvailability} />;
            case View.PLAYER_PROFILE_CREATOR:
                return <PlayerProfileCreatorView user={user!} onBack={() => handleNavigate(View.SOCIAL)} onSave={handleSavePlayerProfile} />;
            case View.FIELD_DETAIL:
                return selectedField ? <FieldDetail complex={{...selectedField, fields: [selectedField], name: selectedField.name.split(' - ')[0]}} initialFieldId={selectedField.id} onBookNow={() => setView(View.BOOKING)} onBack={() => setView(View.HOME)} favoriteFields={user?.favoriteFields || []} onToggleFavorite={() => {}} allBookings={allBookings} weatherData={weatherData} /> : <Home {...commonProps} fields={fields} loading={false} favoriteFields={[]} onToggleFavorite={() => {}} onSearch={() => {}} onSelectField={() => {}} onSearchByLocation={() => {}} isSearchingLocation={false} isWeatherLoading={false} onRefreshWeather={() => {}} allTeams={[]} currentTime={new Date()} acceptedMatches={[]} onSelectBooking={() => {}} />;
            case View.LOGIN:
                return <Login onLogin={handleLogin} onNavigateToHome={() => handleNavigate(View.HOME)} onNavigate={handleNavigate} />;
            case View.PROFILE:
                return <ProfileView user={user!} allTeams={allTeams} setSocialSection={setSocialSection} onLogout={handleLogout} allFields={fields} onToggleFavorite={() => {}} onSelectField={() => {}} onUpdateProfilePicture={() => {}} onRemoveProfilePicture={() => {}} onUpdateUser={() => {}} onChangePassword={() => {}} onUpdateNotificationPreferences={() => {}} onNavigate={handleNavigate} setIsPremiumModalOpen={setIsPremiumModalOpen} />;
            case View.APPEARANCE:
                return <AppearanceSettings currentTheme={theme} onUpdateTheme={setTheme} onBack={() => setView(View.PROFILE)} currentAccentColor={accentColor} onUpdateAccentColor={setAccentColor} />;
            case View.BOOKINGS:
                return <BookingsView bookings={allBookings.filter(b => b.userId === user?.id)} onSelectBooking={(b) => { setView(View.BOOKING_DETAIL); }} />;
            default:
                return <Home {...commonProps} fields={fields} loading={false} favoriteFields={[]} onToggleFavorite={() => {}} onSearch={() => {}} onSelectField={() => {}} onSearchByLocation={() => {}} isSearchingLocation={false} isWeatherLoading={false} onRefreshWeather={() => {}} allTeams={[]} currentTime={new Date()} acceptedMatches={[]} onSelectBooking={() => {}} />;
        }
    };

    const isFullscreen = [View.LOGIN, View.REGISTER, View.FORGOT_PASSWORD, View.PLAYER_PROFILE_CREATOR].includes(view);

    return (
        <div className="bg-bgMain-light dark:bg-bgMain-dark min-h-screen transition-colors duration-300">
            {!isFullscreen && <Header user={user} onNavigate={handleNavigate} onLogout={handleLogout} notifications={user?.notifications || []} invitations={receivedInvitations} onDismiss={() => {}} onMarkAllAsRead={() => {}} onClearAll={() => {}} onAcceptInvitation={handleAcceptInvitation} onRejectInvitation={handleRejectInvitation} onAcceptMatchInvite={() => {}} onRejectMatchInvite={() => {}} currentTime={new Date()} />}
            <main className={`container mx-auto ${!isFullscreen ? 'pb-32' : ''}`}>
                {renderView()}
            </main>
            {!isFullscreen && <BottomNav activeTab={activeTab} onNavigate={handleTabNavigate} />}
            <NotificationContainer notifications={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
            {isPremiumModalOpen && <PremiumLockModal onClose={() => setIsPremiumModalOpen(false)} />}
        </div>
    );
};

export default App;
