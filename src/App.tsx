
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { SoccerField, User, Notification, ConfirmedBooking, Tab, Theme, AccentColor, AppBackgroundColor, WeatherData, SocialSection, Team, Invitation, Player, BookingDetails, OwnerApplication } from '../types';
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
import OwnerRegisterView from '../views/OwnerRegisterView';
import OwnerPendingVerificationView from '../views/OwnerPendingVerificationView';
import * as db from '../database';
import { isFirebaseConfigured } from '../database';
import { getCurrentPosition } from '../utils/geolocation';

const App = () => {
    const [fields, setFields] = useState<SoccerField[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allBookings, setAllBookings] = useState<ConfirmedBooking[]>([]);
    const [allTeams, setAllTeams] = useState<Team[]>([]);
    const [view, setView] = useState<View>(View.HOME);
    const [activeTab, setActiveTab] = useState<Tab>('explore');
    const [user, setUser] = useState<User | null>(null);
    const [selectedField, setSelectedField] = useState<SoccerField | null>(null);
    const [bookingInProgress, setBookingInProgress] = useState<BookingDetails | null>(null);
    const [lastConfirmedBooking, setLastConfirmedBooking] = useState<ConfirmedBooking | null>(null);
    const [selectedDetailBookingId, setSelectedDetailBookingId] = useState<string | null>(null);
    const [isBookingLoading, setIsBookingLoading] = useState(false);
    const [isOwnerRegisterLoading, setIsOwnerRegisterLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<SoccerField[]>([]);
    const [toasts, setToasts] = useState<Notification[]>([]);
    
    // --- APARIENCIA ---
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
    const [accentColor, setAccentColor] = useState<AccentColor>(() => (localStorage.getItem('accentColor') as AccentColor) || 'green');
    const [appBgColor, setAppBgColor] = useState<AppBackgroundColor>(() => (localStorage.getItem('appBgColor') as AppBackgroundColor) || 'default');
    
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState<boolean>(false);
    const [socialSection, setSocialSection] = useState<SocialSection>('hub');
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);
    const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
    const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([]);

    const selectedDetailBooking = useMemo(() => 
        allBookings.find(b => b.id === selectedDetailBookingId) || null
    , [allBookings, selectedDetailBookingId]);

    // --- CLIMA ---
    const fetchWeatherData = useCallback(async (lat?: number, lon?: number) => {
        setIsWeatherLoading(true);
        const latitude = lat || 4.6097;
        const longitude = lon || -74.0817;

        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&hourly=temperature_2m,weather_code,precipitation_probability,wind_speed_10m&timezone=auto`;
            const response = await fetch(url);
            const data = await response.json();

            if (data) {
                const formattedData: WeatherData = {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    timezone: data.timezone,
                    lastUpdated: new Date(),
                    current: {
                        time: new Date(),
                        temperature: data.current.temperature_2m,
                        apparentTemperature: data.current.temperature_2m,
                        precipitationProbability: data.current.relative_humidity_2m,
                        windSpeed: 0,
                        weatherCode: data.current.weather_code
                    },
                    hourly: data.hourly.time.map((timeStr: string, index: number) => ({
                        time: new Date(timeStr),
                        temperature: data.hourly.temperature_2m[index],
                        apparentTemperature: data.hourly.temperature_2m[index],
                        precipitationProbability: data.hourly.precipitation_probability[index],
                        windSpeed: data.hourly.wind_speed_10m[index],
                        weatherCode: data.hourly.weather_code[index]
                    }))
                };
                setWeatherData(formattedData);
            }
        } catch (error) {
            console.error("Error fetching weather:", error);
        } finally {
            setIsWeatherLoading(false);
        }
    }, []);

    useEffect(() => {
        const initWeather = async () => {
            try {
                const pos = await getCurrentPosition({ timeout: 5000 });
                fetchWeatherData(pos.coords.latitude, pos.coords.longitude);
            } catch (e) {
                fetchWeatherData();
            }
        };
        initWeather();
    }, [fetchWeatherData]);

    // --- APARIENCIA ---
    useEffect(() => {
        const root = window.document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const updateAppearance = () => {
            const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
            root.classList.toggle('dark', isDark);
            root.classList.toggle('light', !isDark);
            localStorage.setItem('theme', theme);
            localStorage.setItem('appBgColor', appBgColor);

            const bgConfig = {
                light: { default: '#F7F9F8', turf: '#F0F7F2', midnight: '#F1F4F9', slate: '#F2F4F7' },
                dark: { default: '#121212', turf: '#0A1A0F', midnight: '#0F172A', slate: '#1A1C1E' }
            };

            const selectedBg = isDark ? bgConfig.dark[appBgColor] : bgConfig.light[appBgColor];
            root.style.setProperty('--bg-body', selectedBg);
        };

        updateAppearance();
        mediaQuery.addEventListener('change', updateAppearance);
        return () => mediaQuery.removeEventListener('change', updateAppearance);
    }, [theme, appBgColor]);

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

    // --- AUTO LOGIN (RECORDARME) ---
    useEffect(() => {
        if (!user && allUsers.length > 0) {
            const savedUserId = localStorage.getItem('cancheo_saved_user_id');
            if (savedUserId) {
                const foundUser = allUsers.find(u => u.id === savedUserId);
                if (foundUser) {
                    setUser(foundUser);
                    // Si es propietario aprobado, ir al dashboard directamente
                    if (foundUser.isOwner && foundUser.ownerStatus === 'approved') {
                        setView(View.OWNER_DASHBOARD);
                    } else if (foundUser.ownerStatus === 'pending') {
                        setView(View.OWNER_PENDING_VERIFICATION);
                    }
                }
            }
        }
    }, [allUsers, user]);

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

    const handleLogin = (email: string, password: string, rememberMe: boolean) => {
        const loggedInUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (loggedInUser && loggedInUser.password === password) {
            setUser(loggedInUser);
            
            // Manejo de "Recordarme"
            if (rememberMe) {
                localStorage.setItem('cancheo_saved_user_id', loggedInUser.id);
            } else {
                localStorage.removeItem('cancheo_saved_user_id');
            }

            if (loggedInUser.isOwner && loggedInUser.ownerStatus === 'approved') {
                handleNavigate(View.OWNER_DASHBOARD);
            } else if (loggedInUser.ownerStatus === 'pending') {
                handleNavigate(View.OWNER_PENDING_VERIFICATION);
            } else {
                handleNavigate(View.HOME);
            }
        } else {
            setToasts(prev => [...prev, { id: Date.now(), type: 'error', title: 'Error de acceso', message: 'Credenciales inválidas', timestamp: new Date() }]);
        }
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('cancheo_saved_user_id'); // Limpiar sesión persistente
        setView(View.HOME);
        setActiveTab('explore');
    };

    const handleOwnerRegister = async (appData: any, userData: any) => {
        setIsOwnerRegisterLoading(true);
        try {
            // 1. Crear el usuario
            const createdUser = await db.addUser({
                ...userData,
                isOwner: true,
                ownerStatus: 'pending',
                isAdmin: false,
                favoriteFields: [],
                isPremium: false,
                loyalty: {},
                paymentMethods: [],
                cancheoCoins: 0
            });

            // 2. Crear la solicitud de propietario
            await db.addOwnerApplication({
                ...appData,
                userId: createdUser.id,
                userName: createdUser.name,
                userEmail: createdUser.email,
                status: 'pending'
            });

            setUser(createdUser);
            handleNavigate(View.OWNER_PENDING_VERIFICATION);
            setToasts(prev => [...prev, { id: Date.now(), type: 'success', title: 'Solicitud Enviada', message: 'Estamos revisando tus datos. Te contactaremos pronto.', timestamp: new Date() }]);
        } catch (error) {
            console.error(error);
            setToasts(prev => [...prev, { id: Date.now(), type: 'error', title: 'Error', message: 'No se pudo completar el registro.', timestamp: new Date() }]);
        } finally {
            setIsOwnerRegisterLoading(false);
        }
    };

    const handleConfirmBooking = async (bookingInfo: any) => {
        if (!user) return;
        setIsBookingLoading(true);
        try {
            const finalBooking = await db.addBooking({
                ...bookingInfo,
                userId: user.id,
                userName: user.name,
                userPhone: user.phone || '',
                status: 'confirmed',
                timestamp: new Date()
            });

            if (user.loyalty && finalBooking.field.loyaltyEnabled) {
                const fieldId = finalBooking.field.id;
                const currentLoyalty = user.loyalty[fieldId] || { progress: 0, freeTickets: 0 };
                let nextProgress = currentLoyalty.progress + 1;
                let nextFreeTickets = currentLoyalty.freeTickets;

                if (nextProgress >= (finalBooking.field.loyaltyGoal || 7)) {
                    nextProgress = 0;
                    nextFreeTickets += 1;
                    setToasts(prev => [...prev, { id: Date.now(), type: 'success', title: '¡Cancha Gratis!', message: 'Has ganado un ticket para un partido gratis.', timestamp: new Date() }]);
                }

                const updatedLoyalty = { ...user.loyalty, [fieldId]: { progress: nextProgress, freeTickets: nextFreeTickets } };
                await db.updateUser(user.id, { loyalty: updatedLoyalty });
                setUser(prev => prev ? { ...prev, loyalty: updatedLoyalty } : null);
            }

            setLastConfirmedBooking(finalBooking);
            setView(View.BOOKING_CONFIRMATION);
        } catch (error) {
            setToasts(prev => [...prev, { id: Date.now(), type: 'error', title: 'Error', message: 'No se pudo procesar la reserva.', timestamp: new Date() }]);
        } finally {
            setIsBookingLoading(false);
        }
    };

    const handleCancelBooking = async (id: string) => {
        try {
            await db.updateBooking(id, { status: 'cancelled' });
            setToasts(prev => [...prev, { id: Date.now(), type: 'info', title: 'Reserva Cancelada', message: 'Tu reserva ha sido cancelada exitosamente.', timestamp: new Date() }]);
            setView(View.BOOKINGS);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateScore = async (bookingId: string, scoreA: number, scoreB: number) => {
        try {
            await db.updateBooking(bookingId, { scoreA, scoreB });
        } catch (error) {
            console.error("Error updating score:", error);
        }
    };

    const handleFinalizeMatch = async (bookingId: string, scoreA: number, scoreB: number) => {
        try {
            await db.updateBooking(bookingId, { scoreA, scoreB, status: 'completed' });
            setToasts(prev => [...prev, { id: Date.now(), type: 'success', title: 'Partido Finalizado', message: 'El resultado ha sido registrado oficialmente.', timestamp: new Date() }]);
        } catch (error) {
            console.error("Error finalizing match:", error);
        }
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
        if (!user && ![View.HOME, View.SEARCH_RESULTS, View.FIELD_DETAIL, View.LOGIN, View.REGISTER, View.FORGOT_PASSWORD, View.OWNER_REGISTER].includes(view)) {
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
                return <Home onSearch={(loc) => {}} onSelectField={(f) => { setSelectedField(f); setView(View.FIELD_DETAIL); }} fields={fields} loading={false} favoriteFields={user?.favoriteFields || []} onToggleFavorite={(id) => {}} user={user} onSearchByLocation={() => {}} isSearchingLocation={false} weatherData={weatherData} isWeatherLoading={isWeatherLoading} onRefreshWeather={() => fetchWeatherData(weatherData?.latitude, weatherData?.longitude)} allBookings={allBookings} allTeams={allTeams} currentTime={new Date()} acceptedMatches={[]} onSelectBooking={(b) => { setSelectedDetailBookingId(b.id); setView(View.BOOKING_DETAIL); }} onOwnerRegisterClick={() => handleNavigate(View.OWNER_REGISTER)} />;
            case View.FIELD_DETAIL:
                return selectedField ? <FieldDetail complex={{...selectedField, fields: [selectedField], name: selectedField.name.split(' - ')[0]}} initialFieldId={selectedField.id} onBookNow={(f, t, d) => { setBookingInProgress({field: f, time: t, date: d}); setView(View.BOOKING); }} onBack={() => setView(View.HOME)} favoriteFields={user?.favoriteFields || []} onToggleFavorite={() => {}} allBookings={allBookings} weatherData={weatherData} /> : null;
            case View.BOOKING:
                return bookingInProgress ? <Booking details={bookingInProgress} user={user!} allTeams={allTeams} onConfirm={handleConfirmBooking} onBack={() => setView(View.FIELD_DETAIL)} isBookingLoading={isBookingLoading} /> : null;
            case View.BOOKING_CONFIRMATION:
                return lastConfirmedBooking ? <BookingConfirmation details={lastConfirmedBooking} onDone={() => setView(View.HOME)} weatherData={weatherData} /> : null;
            case View.BOOKINGS:
                return <BookingsView bookings={allBookings.filter(b => b.userId === user?.id)} onSelectBooking={(b) => { setSelectedDetailBookingId(b.id); setView(View.BOOKING_DETAIL); }} />;
            case View.BOOKING_DETAIL:
                return selectedDetailBooking ? <BookingDetailView booking={selectedDetailBooking} user={user!} allTeams={allTeams} onBack={() => setView(View.BOOKINGS)} onCancelBooking={handleCancelBooking} weatherData={weatherData} onUpdateScore={handleUpdateScore} onFinalizeMatch={handleFinalizeMatch} currentTime={new Date()} /> : null;
            case View.SOCIAL:
                return <SocialView {...commonProps} section={socialSection} setSection={setSocialSection} onUpdateUserTeams={handleUpdateUserTeams} onUpdateTeam={handleUpdateTeam} sentInvitations={sentInvitations} onSendInvitation={handleSendInvitation} onCancelInvitation={db.deleteInvitation} onRemovePlayerFromTeam={handleRemovePlayerFromTeam} onLeaveTeam={handleLeaveTeam} onSetAvailability={handleSetAvailability} />;
            case View.PLAYER_PROFILE_CREATOR:
                return <PlayerProfileCreatorView user={user!} onBack={() => handleNavigate(View.SOCIAL)} onSave={handleSavePlayerProfile} />;
            case View.LOGIN:
                return <Login onLogin={handleLogin} onNavigateToHome={() => handleNavigate(View.HOME)} onNavigate={handleNavigate} />;
            case View.REGISTER:
                return <Register onRegister={(nu) => db.addUser(nu).then(u => { setUser(u); handleNavigate(View.HOME); })} onNavigate={handleNavigate} isRegisterLoading={false} />;
            case View.OWNER_REGISTER:
                return <OwnerRegisterView onRegister={handleOwnerRegister} onNavigate={handleNavigate} isOwnerRegisterLoading={isOwnerRegisterLoading} />;
            case View.OWNER_PENDING_VERIFICATION:
                return <OwnerPendingVerificationView onNavigate={handleNavigate} />;
            case View.OWNER_DASHBOARD:
                return <OwnerDashboard user={user!} fields={fields.filter(f => f.ownerId === user?.id)} setFields={setFields} bookings={allBookings.filter(b => b.field.ownerId === user?.id)} setBookings={setAllBookings} announcements={[]} setAnnouncements={() => {}} addNotification={commonProps.addNotification} onLogout={handleLogout} allUsers={allUsers} allFields={fields} />;
            case View.PROFILE:
                return <ProfileView user={user!} allTeams={allTeams} setSocialSection={setSocialSection} onLogout={handleLogout} allFields={fields} onToggleFavorite={() => {}} onSelectField={() => {}} onUpdateProfilePicture={() => {}} onRemoveProfilePicture={() => {}} onUpdateUser={() => {}} onChangePassword={() => {}} onUpdateNotificationPreferences={() => {}} onNavigate={handleNavigate} setIsPremiumModalOpen={setIsPremiumModalOpen} />;
            case View.APPEARANCE:
                return <AppearanceSettings currentTheme={theme} onUpdateTheme={setTheme} onBack={() => setView(View.PROFILE)} currentAccentColor={accentColor} onUpdateAccentColor={setAccentColor} currentBgColor={appBgColor} onUpdateBgColor={setAppBgColor} />;
            default:
                return <Home {...commonProps} fields={fields} loading={false} favoriteFields={[]} onToggleFavorite={() => {}} onSearch={() => {}} onSelectField={() => {}} onSearchByLocation={() => {}} isSearchingLocation={false} isWeatherLoading={false} onRefreshWeather={() => {}} allTeams={[]} currentTime={new Date()} acceptedMatches={[]} onSelectBooking={() => {}} onOwnerRegisterClick={() => handleNavigate(View.OWNER_REGISTER)} />;
        }
    };

    const isFullscreen = [
        View.LOGIN, 
        View.REGISTER, 
        View.FORGOT_PASSWORD, 
        View.PLAYER_PROFILE_CREATOR,
        View.FIELD_DETAIL,
        View.BOOKING,
        View.OWNER_REGISTER,
        View.OWNER_PENDING_VERIFICATION
    ].includes(view);
    const showNavigation = !isFullscreen && user !== null && !user.isOwner;

    return (
        <div className="bg-bgMain-light dark:bg-bgMain-dark min-h-screen transition-all duration-500 ease-in-out">
            {!isFullscreen && <Header user={user} onNavigate={handleNavigate} onLogout={handleLogout} notifications={user?.notifications || []} invitations={receivedInvitations} onDismiss={() => {}} onMarkAllAsRead={() => {}} onClearAll={() => {}} onAcceptInvitation={handleAcceptInvitation} onRejectInvitation={handleRejectInvitation} onAcceptMatchInvite={() => {}} onRejectMatchInvite={() => {}} currentTime={new Date()} />}
            <main className={`container mx-auto ${showNavigation ? 'pb-32' : ''}`}>
                {renderView()}
            </main>
            {showNavigation && <BottomNav activeTab={activeTab} onNavigate={handleTabNavigate} />}
            <NotificationContainer notifications={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
            {isPremiumModalOpen && <PremiumLockModal onClose={() => setIsPremiumModalOpen(false)} />}
        </div>
    );
};

export default App;
