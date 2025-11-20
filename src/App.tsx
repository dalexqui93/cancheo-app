
import React, { useState, useEffect, useCallback } from 'react';
import { View } from '../types';
import type { User, Notification, SoccerField, ConfirmedBooking, Team, WeatherData, SocialSection, Invitation, AcceptedMatchInvite, OwnerApplication, Theme, AccentColor, Announcement } from '../types';
import * as db from '../database';
import { getCurrentPosition } from '../utils/geolocation';

// Views
import Home from '../views/Home';
import Login from '../views/Login';
import Register from '../views/Register';
import ProfileView from '../views/ProfileView';
import SearchResults from '../views/SearchResults';
import FieldDetail from '../views/FieldDetail';
import Booking from '../views/Booking';
import BookingConfirmation from '../views/BookingConfirmation';
import BookingsView from '../views/BookingsView';
import SocialView from '../views/SocialView';
import OwnerDashboard from '../views/AdminDashboard';
import SuperAdminDashboardView from '../views/SuperAdminDashboard';
import OwnerRegisterView from '../views/OwnerRegisterView';
import OwnerPendingVerificationView from '../views/OwnerPendingVerificationView';
import HelpView from '../views/HelpView';
import ForgotPasswordView from '../views/ForgotPassword';
import AppearanceSettings from '../views/AppearanceSettings';
import PaymentMethodsView from '../views/PaymentMethodsView';
import PlayerProfileCreatorView from '../views/player_profile/PlayerProfileCreatorView';

// Components
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import NotificationContainer from '../components/NotificationContainer';
import PremiumLockModal from '../components/PremiumLockModal';
import RewardAnimation from '../components/RewardAnimation';
import RatingModal from '../components/RatingModal';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [currentView, setCurrentView] = useState<View>(View.HOME);
    const [fields, setFields] = useState<SoccerField[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allTeams, setAllTeams] = useState<Team[]>([]);
    const [bookings, setBookings] = useState<ConfirmedBooking[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isWeatherLoading, setIsWeatherLoading] = useState(false);
    const [theme, setTheme] = useState<Theme>('system');
    const [accentColor, setAccentColor] = useState<AccentColor>('green');
    
    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [rewardField, setRewardField] = useState<SoccerField | null>(null);
    const [fieldToRate, setFieldToRate] = useState<SoccerField | null>(null);
    
    // Specific View State
    const [selectedField, setSelectedField] = useState<SoccerField | null>(null);
    const [bookingDetails, setBookingDetails] = useState<{ field: SoccerField; time: string; date: Date } | null>(null);
    const [lastConfirmedBooking, setLastConfirmedBooking] = useState<ConfirmedBooking | null>(null);
    const [socialSection, setSocialSection] = useState<SocialSection>('hub');
    const [searchResults, setSearchResults] = useState<SoccerField[]>([]);
    const [ownerApplications, setOwnerApplications] = useState<OwnerApplication[]>([]);
    
    // --- Data Fetching ---
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [fetchedFields, fetchedUsers, fetchedTeams, fetchedBookings, fetchedAnnouncements, fetchedOwnerApps] = await Promise.all([
                    db.getFields(),
                    db.getUsers(),
                    db.getTeams(),
                    db.getAllBookings(),
                    db.getAnnouncements(),
                    db.getOwnerApplications()
                ]);
                
                setFields(fetchedFields);
                setAllUsers(fetchedUsers);
                setAllTeams(fetchedTeams);
                setBookings(fetchedBookings);
                setAnnouncements(fetchedAnnouncements);
                setOwnerApplications(fetchedOwnerApps);
                
                // Mock User Session (Simulated persistence)
                const savedUserEmail = localStorage.getItem('userEmail');
                if (savedUserEmail) {
                    const foundUser = fetchedUsers.find((u: User) => u.email === savedUserEmail);
                    if (foundUser) {
                        setUser(foundUser);
                        setNotifications(foundUser.notifications || []);
                    }
                }
                
                // Initial Weather Fetch
                handleRefreshWeather();
                
            } catch (error) {
                console.error("Error loading initial data:", error);
                showToast({ type: 'error', title: 'Error de conexión', message: 'No se pudieron cargar los datos iniciales.' });
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
        
        // Listeners
        const unsubscribeBookings = db.listenToAllBookings((updatedBookings: ConfirmedBooking[]) => {
             setBookings(updatedBookings);
        });
        
        const unsubscribeTeams = db.listenToAllTeams((updatedTeams: Team[]) => {
            setAllTeams(updatedTeams);
        });

        return () => {
            unsubscribeBookings();
            unsubscribeTeams();
        };
    }, []);

    useEffect(() => {
        if (user) {
            const unsubscribeInvites = db.listenToInvitationsForUser(user.id, (invites: Invitation[]) => {
                setInvitations(invites);
            });
            return () => unsubscribeInvites();
        }
    }, [user?.id]);

    // --- Helper Functions ---
    const showToast = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
        const newNotification = {
            ...notification,
            id: Date.now(),
            timestamp: new Date(),
        };
        setNotifications(prev => [...prev, newNotification]);
        
        // If logged in, update user notifications in DB
        if (user) {
             const updatedNotifications = [...(user.notifications || []), newNotification];
             // Optimistic update
             setUser({...user, notifications: updatedNotifications});
             db.updateUser(user.id, { notifications: updatedNotifications }).catch(err => console.error(err));
        }
    };

    const sendNotificationToUser = async (userId: string, notification: Omit<Notification, 'id' | 'timestamp'>) => {
        const targetUser = allUsers.find(u => u.id === userId);
        if (targetUser) {
            const fullNotification = { ...notification, id: Date.now(), timestamp: new Date() };
            const updatedNotifications = [...(targetUser.notifications || []), fullNotification];
            try {
                await db.updateUser(userId, { notifications: updatedNotifications });
                // Update local state if sending to self (unlikely but possible)
                if (user && userId === user.id) {
                     setUser({ ...user, notifications: updatedNotifications });
                     setNotifications(updatedNotifications);
                }
            } catch (error) {
                console.error("Error sending notification:", error);
            }
        }
    };

    // --- Handlers ---
    const handleLogin = (email: string) => {
        const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (foundUser) {
            setUser(foundUser);
            setNotifications(foundUser.notifications || []);
            localStorage.setItem('userEmail', email);
            setCurrentView(View.HOME);
            showToast({ type: 'success', title: '¡Bienvenido!', message: `Hola de nuevo, ${foundUser.name}` });
        } else {
             showToast({ type: 'error', title: 'Error', message: 'Usuario no encontrado o contraseña incorrecta.' });
        }
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('userEmail');
        setCurrentView(View.LOGIN);
        setNotifications([]);
    };

    const handleRegister = async (newUser: any) => {
        try {
            const createdUser = await db.addUser(newUser);
            setAllUsers(prev => [...prev, createdUser]);
            handleLogin(createdUser.email);
        } catch (error) {
             showToast({ type: 'error', title: 'Error', message: 'No se pudo registrar el usuario.' });
        }
    };

    const handleNavigate = (view: View) => {
        setCurrentView(view);
        window.scrollTo(0, 0);
    };

    const handleAcceptMatchInvite = async (notification: Notification) => {
        if (!user || !notification.payload) return;

        const updatedNotifications = notifications.filter(n => n.id !== notification.id);
        setNotifications(updatedNotifications);
        try {
            await db.updateUser(user.id, { notifications: updatedNotifications });
        } catch (error) {
            console.error("Error removing match invite notification:", String(error));
        }

        // 1. Notify the inviter
        const notificationForInviter: Omit<Notification, 'id' | 'timestamp'> = {
            type: 'success',
            title: 'Invitación Aceptada',
            message: `${user.name} ha aceptado tu invitación al partido en ${notification.payload.fieldName}.`,
            read: false,
        };
        await sendNotificationToUser(notification.payload.fromUserId, notificationForInviter);

        // 2. Add accepted match to user profile
        const inviter = allUsers.find(u => u.id === notification.payload!.fromUserId);
        const acceptedMatch: AcceptedMatchInvite = {
            id: notification.id.toString(),
            bookingId: notification.payload.bookingId,
            inviterId: notification.payload.fromUserId,
            inviterName: notification.payload.fromUserName,
            inviterPhone: inviter?.phone,
            fieldName: notification.payload.fieldName,
            matchDate: new Date(notification.payload.matchDate),
            matchTime: notification.payload.matchTime,
            acceptedAt: new Date()
        };

        const updatedAcceptedMatches = [...(user.acceptedMatchInvites || []), acceptedMatch];
        
        // 3. Automatically disable availability
        let updatedPlayerProfile = user.playerProfile;
        if (updatedPlayerProfile) {
            updatedPlayerProfile = {
                ...updatedPlayerProfile,
                isAvailableToday: false,
                // Optionally clear note or leave it for next time
            };
        }
        
        try {
            const updates: any = { acceptedMatchInvites: updatedAcceptedMatches };
            if (updatedPlayerProfile) {
                updates.playerProfile = updatedPlayerProfile;
            }

            await db.updateUser(user.id, updates);
            
            const updatedUser = { 
                ...user, 
                acceptedMatchInvites: updatedAcceptedMatches,
                playerProfile: updatedPlayerProfile || user.playerProfile
            };
            
            setUser(updatedUser);
            setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        } catch (error) {
             console.error("Error saving accepted match:", String(error));
             showToast({ type: 'error', title: 'Error', message: 'No se pudo guardar la aceptación del partido.' });
             return;
        }

        showToast({
            type: 'success',
            title: 'Invitación Aceptada',
            message: `Confirmaste tu asistencia. Tu estado 'Disponible hoy' se ha desactivado.`,
        });
    };

    const handleRejectMatchInvite = async (notification: Notification) => {
        if(!user) return;
         const updatedNotifications = notifications.filter(n => n.id !== notification.id);
        setNotifications(updatedNotifications);
         try {
            await db.updateUser(user.id, { notifications: updatedNotifications });
            showToast({ type: 'info', title: 'Invitación Rechazada', message: 'Has rechazado la invitación.' });
        } catch (error) {
             console.error("Error removing notification:", error);
        }
    };

    const handleRefreshWeather = async () => {
        setIsWeatherLoading(true);
        try {
             const position = await getCurrentPosition();
             // Mock fetch for now, replace with actual API call if needed or keep using mock data generator
             // For this example, we'll simulate a response structure based on types
             const mockWeather: WeatherData = {
                 latitude: position.coords.latitude,
                 longitude: position.coords.longitude,
                 timezone: 'America/Bogota',
                 lastUpdated: new Date(),
                 locationName: 'Ubicación Actual',
                 current: {
                     time: new Date(),
                     temperature: 22,
                     apparentTemperature: 24,
                     precipitationProbability: 10,
                     windSpeed: 5,
                     weatherCode: 1
                 },
                 hourly: Array.from({length: 24}, (_, i) => ({
                     time: new Date(Date.now() + i * 3600000),
                     temperature: 20 + Math.random() * 5,
                     apparentTemperature: 22 + Math.random() * 5,
                     precipitationProbability: Math.random() * 20,
                     windSpeed: Math.random() * 10,
                     weatherCode: 1
                 }))
             };
             setWeatherData(mockWeather);
        } catch (error) {
            console.error("Weather fetch failed:", error);
        } finally {
            setIsWeatherLoading(false);
        }
    };

    const getTabForView = (view: View): 'explore' | 'bookings' | 'community' | 'profile' => {
        switch (view) {
            case View.HOME:
            case View.SEARCH_RESULTS:
            case View.FIELD_DETAIL:
            case View.BOOKING:
            case View.BOOKING_CONFIRMATION:
                return 'explore';
            case View.BOOKINGS:
            case View.BOOKING_DETAIL:
                return 'bookings';
            case View.SOCIAL:
            case View.PLAYER_PROFILE_CREATOR:
                return 'community';
            case View.PROFILE:
            case View.APPEARANCE:
            case View.HELP_SUPPORT:
            case View.PAYMENT_METHODS:
                return 'profile';
            default:
                return 'explore';
        }
    };

    // --- Render ---
    
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">Cargando...</div>;
    }

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 ${theme}`}>
            {/* Header (conditionally rendered) */}
            {![View.LOGIN, View.REGISTER, View.FORGOT_PASSWORD, View.OWNER_REGISTER, View.OWNER_PENDING_VERIFICATION, View.SUPER_ADMIN_DASHBOARD, View.OWNER_DASHBOARD].includes(currentView) && (
                <Header 
                    user={user} 
                    onNavigate={handleNavigate} 
                    onLogout={handleLogout}
                    notifications={notifications}
                    invitations={invitations}
                    onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
                    onMarkAllAsRead={() => {
                         const updated = notifications.map(n => ({ ...n, read: true }));
                         setNotifications(updated);
                         if(user) db.updateUser(user.id, { notifications: updated });
                    }}
                    onClearAll={() => {
                         const invites = notifications.filter(n => n.type === 'match_invite');
                         setNotifications(invites);
                         if(user) db.updateUser(user.id, { notifications: invites });
                    }}
                    onAcceptInvitation={async (inv) => {
                         // Logic to accept team invitation
                         if(!user) return;
                         await db.updateUser(user.id, { teamIds: [...(user.teamIds || []), inv.teamId] });
                         await db.deleteInvitation(inv.id);
                         setInvitations(prev => prev.filter(i => i.id !== inv.id));
                         showToast({ type: 'success', title: 'Equipo Unido', message: `Te has unido a ${inv.teamName}.` });
                    }}
                    onRejectInvitation={async (inv) => {
                        await db.deleteInvitation(inv.id);
                        setInvitations(prev => prev.filter(i => i.id !== inv.id));
                        showToast({ type: 'info', title: 'Invitación Rechazada', message: `Rechazaste unirte a ${inv.teamName}.` });
                    }}
                    onAcceptMatchInvite={handleAcceptMatchInvite}
                    onRejectMatchInvite={handleRejectMatchInvite}
                    currentTime={new Date()}
                />
            )}

            <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
                 {currentView === View.HOME && (
                    <Home 
                        onSearch={(loc, filters) => {
                            // Filter logic
                            let results = fields;
                             if (loc) {
                                const term = loc.toLowerCase();
                                results = results.filter(f => f.name.toLowerCase().includes(term) || f.city.toLowerCase().includes(term));
                            }
                            if (filters?.size) {
                                results = results.filter(f => f.size === filters.size);
                            }
                            setSearchResults(results);
                            setCurrentView(View.SEARCH_RESULTS);
                        }}
                        onSelectField={(f) => { setSelectedField(f); setCurrentView(View.FIELD_DETAIL); }}
                        fields={fields}
                        loading={false}
                        favoriteFields={user?.favoriteFields || []}
                        onToggleFavorite={(id) => {
                            if(!user) return;
                            const newFavs = user.favoriteFields.includes(id) 
                                ? user.favoriteFields.filter(f => f !== id) 
                                : [...user.favoriteFields, id];
                            setUser({...user, favoriteFields: newFavs});
                            db.updateUser(user.id, { favoriteFields: newFavs });
                        }}
                        theme={theme}
                        announcements={announcements}
                        user={user}
                        onSearchByLocation={() => {
                            setIsSearchingLocation(true);
                            getCurrentPosition().then(() => {
                                setIsSearchingLocation(false);
                                // Sort fields by distance (mock)
                                showToast({ type: 'info', title: 'Ubicación', message: 'Mostrando canchas cercanas.' });
                            }).catch(() => setIsSearchingLocation(false));
                        }}
                        isSearchingLocation={isSearchingLocation}
                        weatherData={weatherData}
                        isWeatherLoading={isWeatherLoading}
                        onRefreshWeather={handleRefreshWeather}
                        onSearchResults={(res) => { setSearchResults(res); setCurrentView(View.SEARCH_RESULTS); }}
                        allBookings={bookings}
                        allTeams={allTeams}
                        currentTime={new Date()}
                        acceptedMatches={user?.acceptedMatchInvites}
                        onCancelMatchAttendance={async (id) => {
                             if(!user) return;
                             const updated = user.acceptedMatchInvites?.filter(m => m.id !== id);
                             setUser({...user, acceptedMatchInvites: updated});
                             await db.updateUser(user.id, { acceptedMatchInvites: updated });
                             showToast({type: 'info', title: 'Asistencia Cancelada', message: 'Ya no asistirás a este partido.'});
                        }}
                    />
                )}
                
                {currentView === View.SEARCH_RESULTS && (
                     <SearchResults 
                        fields={searchResults}
                        onSelectField={(f) => { setSelectedField(f); setCurrentView(View.FIELD_DETAIL); }}
                        onBack={() => setCurrentView(View.HOME)}
                        favoriteFields={user?.favoriteFields || []}
                        onToggleFavorite={(id) => {
                             if(!user) return;
                             const newFavs = user.favoriteFields.includes(id) ? user.favoriteFields.filter(f => f !== id) : [...user.favoriteFields, id];
                             setUser({...user, favoriteFields: newFavs});
                             db.updateUser(user.id, { favoriteFields: newFavs });
                        }}
                        theme={theme}
                     />
                )}

                {currentView === View.FIELD_DETAIL && selectedField && (
                    <FieldDetail 
                        complex={{
                             name: selectedField.name, // Assuming simple mapping for now
                             address: selectedField.address,
                             city: selectedField.city,
                             description: selectedField.description,
                             images: selectedField.images,
                             services: selectedField.services,
                             fields: [selectedField] // Or fetch siblings
                        }}
                        initialFieldId={selectedField.id}
                        onBookNow={(field, time, date) => {
                            setBookingDetails({ field, time, date });
                            setCurrentView(View.BOOKING);
                        }}
                        onBack={() => setCurrentView(View.HOME)}
                        favoriteFields={user?.favoriteFields || []}
                        onToggleFavorite={(id) => {
                              if(!user) return;
                             const newFavs = user.favoriteFields.includes(id) ? user.favoriteFields.filter(f => f !== id) : [...user.favoriteFields, id];
                             setUser({...user, favoriteFields: newFavs});
                             db.updateUser(user.id, { favoriteFields: newFavs });
                        }}
                        allBookings={bookings}
                        weatherData={weatherData}
                    />
                )}

                {currentView === View.BOOKING && bookingDetails && user && (
                    <Booking 
                        details={bookingDetails}
                        user={user}
                        allTeams={allTeams}
                        onConfirm={async (info) => {
                            const newBooking = await db.addBooking({ ...info, userId: user.id, userName: user.name, userPhone: user.phone, status: 'confirmed' });
                            setBookings(prev => [...prev, newBooking]);
                            setLastConfirmedBooking(newBooking);
                            setCurrentView(View.BOOKING_CONFIRMATION);
                        }}
                        onBack={() => setCurrentView(View.FIELD_DETAIL)}
                        isBookingLoading={false}
                    />
                )}

                {currentView === View.BOOKING_CONFIRMATION && lastConfirmedBooking && (
                    <BookingConfirmation 
                        details={lastConfirmedBooking}
                        onDone={() => setCurrentView(View.HOME)}
                        weatherData={weatherData}
                    />
                )}

                {currentView === View.SOCIAL && user && (
                    <SocialView 
                        user={user}
                        allTeams={allTeams}
                        allUsers={allUsers}
                        allBookings={bookings}
                        addNotification={showToast}
                        onNavigate={handleNavigate}
                        setIsPremiumModalOpen={setIsPremiumModalOpen}
                        section={socialSection}
                        setSection={setSocialSection}
                        onUpdateUserTeams={async (teamIds) => {
                             setUser(prev => prev ? ({ ...prev, teamIds }) : null);
                             await db.updateUser(user.id, { teamIds });
                        }}
                        onUpdateTeam={async (teamId, updates) => {
                             await db.updateTeam(teamId, updates);
                             setAllTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...updates } : t));
                        }}
                        sentInvitations={invitations} // This should ideally be outgoing invites, simplified here
                        onSendInvitation={async (team, player) => {
                            // Logic to send invite
                             const inv = await db.addInvitation({
                                 teamId: team.id, teamName: team.name, teamLogo: team.logo,
                                 fromUserId: user.id, fromUserName: user.name,
                                 toUserId: player.id, toUserName: player.name,
                                 timestamp: new Date()
                             });
                             // Note: In a real app we would update a sentInvitations state
                             showToast({ type: 'success', title: 'Invitación Enviada', message: `Invitación enviada a ${player.name}` });
                        }}
                        onCancelInvitation={async (id) => {
                            await db.deleteInvitation(id);
                        }}
                        onRemovePlayerFromTeam={async (teamId, playerId) => {
                             const team = allTeams.find(t => t.id === teamId);
                             if(team) {
                                 const updatedPlayers = team.players.filter(p => p.id !== playerId);
                                 await db.updateTeam(teamId, { players: updatedPlayers });
                                 setAllTeams(prev => prev.map(t => t.id === teamId ? { ...t, players: updatedPlayers } : t));
                                 // Also update the user's teamIds
                                 const playerUser = allUsers.find(u => u.id === playerId);
                                 if(playerUser && playerUser.teamIds) {
                                     const updatedTeamIds = playerUser.teamIds.filter(tid => tid !== teamId);
                                     await db.updateUser(playerId, { teamIds: updatedTeamIds });
                                 }
                             }
                        }}
                        onLeaveTeam={async (teamId) => {
                             const team = allTeams.find(t => t.id === teamId);
                             if(team) {
                                 const updatedPlayers = team.players.filter(p => p.id !== user.id);
                                 await db.updateTeam(teamId, { players: updatedPlayers });
                                 setAllTeams(prev => prev.map(t => t.id === teamId ? { ...t, players: updatedPlayers } : t));
                                 
                                 const updatedTeamIds = (user.teamIds || []).filter(tid => tid !== teamId);
                                 setUser({ ...user, teamIds: updatedTeamIds });
                                 await db.updateUser(user.id, { teamIds: updatedTeamIds });
                             }
                        }}
                        weatherData={weatherData}
                        onSetAvailability={async (isAvailable, note) => {
                             const updatedProfile = { ...user.playerProfile!, isAvailableToday: isAvailable, availabilityNote: note };
                             setUser({ ...user, playerProfile: updatedProfile });
                             await db.updateUser(user.id, { playerProfile: updatedProfile });
                        }}
                    />
                )}

                {currentView === View.PLAYER_PROFILE_CREATOR && user && (
                     <PlayerProfileCreatorView 
                        user={user}
                        onBack={() => setCurrentView(View.SOCIAL)}
                        onSave={async (profile) => {
                            setUser({ ...user, playerProfile: profile });
                            await db.updateUser(user.id, { playerProfile: profile });
                            setCurrentView(View.SOCIAL);
                            showToast({ type: 'success', title: 'Perfil Actualizado', message: 'Tu perfil de jugador ha sido guardado.' });
                        }}
                     />
                )}

                {currentView === View.PROFILE && user && (
                    <ProfileView 
                        user={user}
                        allTeams={allTeams}
                        setSocialSection={setSocialSection}
                        onLogout={handleLogout}
                        allFields={fields}
                        onToggleFavorite={(id) => {
                             const newFavs = user.favoriteFields.includes(id) ? user.favoriteFields.filter(f => f !== id) : [...user.favoriteFields, id];
                             setUser({...user, favoriteFields: newFavs});
                             db.updateUser(user.id, { favoriteFields: newFavs });
                        }}
                        onSelectField={(f) => { setSelectedField(f); setCurrentView(View.FIELD_DETAIL); }}
                        onUpdateProfilePicture={async (url) => {
                             setUser({...user, profilePicture: url});
                             await db.updateUser(user.id, { profilePicture: url });
                        }}
                        onRemoveProfilePicture={async () => {
                             setUser({...user, profilePicture: undefined});
                             await db.updateUser(user.id, { profilePicture: null });
                        }}
                        onUpdateUser={async (data) => {
                             setUser({...user, ...data});
                             await db.updateUser(user.id, data);
                        }}
                        onChangePassword={async (current, newPass) => {
                             // Mock logic
                             await db.updateUser(user.id, { password: newPass });
                             showToast({ type: 'success', title: 'Contraseña Actualizada', message: 'Tu contraseña ha sido cambiada.' });
                        }}
                        onUpdateNotificationPreferences={async (prefs) => {
                             setUser({...user, notificationPreferences: prefs});
                             await db.updateUser(user.id, { notificationPreferences: prefs });
                        }}
                        onNavigate={handleNavigate}
                        setIsPremiumModalOpen={setIsPremiumModalOpen}
                    />
                )}

                {currentView === View.APPEARANCE && (
                    <AppearanceSettings 
                        currentTheme={theme}
                        onUpdateTheme={setTheme}
                        onBack={() => setCurrentView(View.PROFILE)}
                        currentAccentColor={accentColor}
                        onUpdateAccentColor={setAccentColor}
                    />
                )}

                {currentView === View.BOOKINGS && user && (
                     <BookingsView 
                        bookings={bookings.filter(b => b.userId === user.id)}
                        onSelectBooking={(b) => {
                            // Mock navigation to details
                            showToast({type: 'info', title: 'Detalle', message: `Viendo reserva en ${b.field.name}`});
                        }}
                     />
                )}

                {currentView === View.LOGIN && (
                    <Login 
                        onLogin={handleLogin}
                        onNavigateToHome={() => setCurrentView(View.HOME)}
                        onNavigate={handleNavigate}
                    />
                )}
                
                {currentView === View.REGISTER && (
                    <Register 
                        onRegister={handleRegister}
                        onNavigate={handleNavigate}
                        isRegisterLoading={false}
                    />
                )}

                {currentView === View.OWNER_REGISTER && (
                    <OwnerRegisterView 
                        onRegister={async (appData, userData) => {
                             try {
                                 // 1. Create User
                                 const newUser = await db.addUser({ ...userData, isOwner: true, ownerStatus: 'pending', notificationPreferences: { newAvailability: true, specialDiscounts: true, importantNews: true }, loyalty: {}, paymentMethods: [] });
                                 // 2. Create Application
                                 await db.addOwnerApplication({ ...appData, userId: newUser.id, status: 'pending', userName: newUser.name, userEmail: newUser.email });
                                 setCurrentView(View.OWNER_PENDING_VERIFICATION);
                             } catch (error) {
                                 showToast({ type: 'error', title: 'Error', message: 'No se pudo enviar la solicitud.' });
                             }
                        }}
                        onNavigate={handleNavigate}
                        isOwnerRegisterLoading={false}
                    />
                )}

                {currentView === View.OWNER_PENDING_VERIFICATION && (
                    <OwnerPendingVerificationView onNavigate={handleNavigate} />
                )}

                {currentView === View.OWNER_DASHBOARD && user && (
                     <OwnerDashboard 
                        user={user}
                        fields={fields.filter(f => f.ownerId === user.id)}
                        setFields={setFields}
                        bookings={bookings.filter(b => b.field.ownerId === user.id)}
                        setBookings={setBookings}
                        announcements={announcements.filter(a => a.ownerId === user.id)}
                        setAnnouncements={setAnnouncements}
                        addNotification={showToast}
                        onLogout={handleLogout}
                        allUsers={allUsers}
                        allFields={fields}
                     />
                )}

                {currentView === View.SUPER_ADMIN_DASHBOARD && user && (
                    <SuperAdminDashboardView 
                        currentUser={user}
                        allUsers={allUsers}
                        setAllUsers={setAllUsers}
                        fields={fields}
                        setFields={setFields}
                        ownerApplications={ownerApplications}
                        setOwnerApplications={setOwnerApplications}
                        addNotification={showToast}
                        onLogout={handleLogout}
                    />
                )}

                {currentView === View.HELP_SUPPORT && (
                    <HelpView onNavigate={handleNavigate} />
                )}
                
                {currentView === View.FORGOT_PASSWORD && (
                    <ForgotPasswordView onNavigate={handleNavigate} addNotification={showToast} />
                )}
                 
                {currentView === View.PAYMENT_METHODS && user && (
                    <PaymentMethodsView 
                        user={user}
                        onBack={() => setCurrentView(View.PROFILE)}
                        onAddPaymentMethod={async (method) => {
                             const newMethod = { ...method, id: `pm-${Date.now()}`, isDefault: user.paymentMethods?.length === 0 };
                             const updatedMethods = [...(user.paymentMethods || []), newMethod];
                             setUser({ ...user, paymentMethods: updatedMethods });
                             await db.updateUser(user.id, { paymentMethods: updatedMethods });
                             showToast({ type: 'success', title: 'Método Agregado', message: 'Se ha guardado tu método de pago.' });
                        }}
                        onDeletePaymentMethod={async (id) => {
                             const updatedMethods = user.paymentMethods?.filter(m => m.id !== id) || [];
                             setUser({ ...user, paymentMethods: updatedMethods });
                             await db.updateUser(user.id, { paymentMethods: updatedMethods });
                             showToast({ type: 'info', title: 'Método Eliminado', message: 'Se ha eliminado el método de pago.' });
                        }}
                        onSetDefaultPaymentMethod={async (id) => {
                             const updatedMethods = user.paymentMethods?.map(m => ({ ...m, isDefault: m.id === id })) || [];
                             setUser({ ...user, paymentMethods: updatedMethods });
                             await db.updateUser(user.id, { paymentMethods: updatedMethods });
                             showToast({ type: 'success', title: 'Actualizado', message: 'Se ha actualizado tu método predeterminado.' });
                        }}
                    />
                )}

            </main>
            
            {/* Bottom Navigation (conditionally rendered) */}
            {user && !user.isOwner && !user.isAdmin && ![View.LOGIN, View.REGISTER, View.BOOKING, View.BOOKING_CONFIRMATION, View.FIELD_DETAIL, View.SOCIAL, View.PLAYER_PROFILE_CREATOR].includes(currentView) && (
                <BottomNav activeTab={getTabForView(currentView)} onNavigate={(tab) => {
                    if (tab === 'explore') setCurrentView(View.HOME);
                    if (tab === 'bookings') setCurrentView(View.BOOKINGS);
                    if (tab === 'community') { setCurrentView(View.SOCIAL); setSocialSection('hub'); }
                    if (tab === 'profile') setCurrentView(View.PROFILE);
                }} />
            )}

            <NotificationContainer notifications={notifications} onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
            
            {isPremiumModalOpen && <PremiumLockModal onClose={() => setIsPremiumModalOpen(false)} />}
            {rewardField && <RewardAnimation field={rewardField} onAnimationEnd={() => { setFieldToRate(rewardField); setRewardField(null); }} />}
            {fieldToRate && <RatingModal field={fieldToRate} onClose={() => setFieldToRate(null)} onSubmit={(id, rating, comment) => {
                 // Handle rating submit
                 showToast({ type: 'success', title: '¡Gracias!', message: 'Tu opinión nos ayuda a mejorar.' });
                 setFieldToRate(null);
            }} />}

        </div>
    );
};

export default App;
