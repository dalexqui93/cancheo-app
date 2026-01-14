import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { SoccerField, User, Notification, BookingDetails, ConfirmedBooking, Tab, Theme, AccentColor, PaymentMethod, CardPaymentMethod, Player, Announcement, Loyalty, UserLoyalty, Review, OwnerApplication, WeatherData, SocialSection, Team, Invitation, ChatMessage, SystemMessage, AcceptedMatchInvite } from '../types';
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
import RewardAnimation from '../components/RewardAnimation';
import RatingModal from '../components/RatingModal';
import OwnerRegisterView from '../views/OwnerRegisterView';
import OwnerPendingVerificationView from '../views/OwnerPendingVerificationView';
import SuperAdminDashboard from '../views/SuperAdminDashboard';
import MatchSetupModal from '../components/MatchSetupModal';
import * as db from '../database';
import { isFirebaseConfigured } from '../database';
import { getCurrentPosition, calculateDistance } from '../utils/geolocation';

const FirebaseWarningBanner: React.FC = () => {
    if (isFirebaseConfigured) {
        return null;
    }

    return (
        <div className="bg-yellow-400 text-yellow-900 text-center p-2 font-semibold text-sm sticky top-0 z-[101]">
            <div className="container mx-auto">
                Atención: Firebase no está configurado. La aplicación se ejecutará en modo de demostración. Edita <strong>database.ts</strong>.
            </div>
        </div>
    );
};

const OfflineBanner: React.FC<{ isOnline: boolean }> = ({ isOnline }) => {
    if (isOnline) {
        return null;
    }

    return (
        <div className="bg-gray-700 text-white text-center p-2 font-semibold text-sm sticky top-0 z-[101] animate-fade-in">
            <div className="container mx-auto">
                Estás desconectado. La aplicación se está ejecutando en modo offline.
            </div>
        </div>
    );
}

const App = () => {
    const [fields, setFields] = useState<SoccerField[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [ownerApplications, setOwnerApplications] = useState<OwnerApplication[]>([]);
    const [allBookings, setAllBookings] = useState<ConfirmedBooking[]>([]);
    const [allTeams, setAllTeams] = useState<Team[]>([]);
    const [view, setView] = useState<View>(View.HOME);
    const [activeTab, setActiveTab] = useState<Tab>('explore');
    const [user, setUser] = useState<User | null>(null);
    const [selectedField, setSelectedField] = useState<SoccerField | null>(null);
    const [searchResults, setSearchResults] = useState<SoccerField[]>([]);
    const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
    const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [toasts, setToasts] = useState<Notification[]>([]);
    const [bookings, setBookings] = useState<ConfirmedBooking[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<ConfirmedBooking | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
    const [accentColor, setAccentColor] = useState<AccentColor>(() => (localStorage.getItem('accentColor') as AccentColor) || 'orange');
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState<boolean>(false);
    const [animationClass, setAnimationClass] = useState<string>('animate-fade-in');
    const [viewKey, setViewKey] = useState<number>(0);
    const [rewardInfo, setRewardInfo] = useState<{ field: SoccerField } | null>(null);
    const [ratingInfo, setRatingInfo] = useState<{ field: SoccerField } | null>(null);
    const [isBookingLoading, setIsBookingLoading] = useState<boolean>(false);
    const [isRegisterLoading, setIsRegisterLoading] = useState<boolean>(false);
    const [isOwnerRegisterLoading, setIsOwnerRegisterLoading] = useState<boolean>(false);
    const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);
    const [socialSection, setSocialSection] = useState<SocialSection>('hub');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([]);
    const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [matchSetupBooking, setMatchSetupBooking] = useState<ConfirmedBooking | null>(null);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);

    // Persistencia y Lógica de Temas
    useEffect(() => {
        const applyTheme = () => {
            const root = window.document.documentElement;
            let isDark = theme === 'dark';
            
            if (theme === 'system') {
                isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }

            root.classList.toggle('dark', isDark);
            localStorage.setItem('theme', theme);
        };

        applyTheme();

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = () => {
            if (theme === 'system') {
                applyTheme();
            }
        };

        mediaQuery.addEventListener('change', handleSystemChange);
        return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('accentColor', accentColor);
    }, [accentColor]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchWeather = useCallback(async () => {
        setIsWeatherLoading(true);
        try {
            const position = await getCurrentPosition({ timeout: 10000, maximumAge: 3600000 });
            const { latitude, longitude } = position.coords;
            const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weathercode&hourly=temperature_2m,apparent_temperature,precipitation_probability,weathercode,windspeed_10m&timezone=auto`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Weather fetch failed');
            const data = await response.json();
            
            const now = new Date();
            const currentHourIndex = data.hourly.time.findIndex((t: string) => new Date(t) >= now);
            
            const hourlyData = data.hourly.time.map((t: string, i: number) => ({
                time: new Date(t),
                temperature: data.hourly.temperature_2m[i],
                apparentTemperature: data.hourly.apparent_temperature[i],
                precipitationProbability: data.hourly.precipitation_probability[i],
                windSpeed: data.hourly.windspeed_10m[i],
                weatherCode: data.hourly.weathercode[i],
            }));

            setWeatherData({
                latitude: data.latitude,
                longitude: data.longitude,
                timezone: data.timezone,
                lastUpdated: new Date(),
                current: hourlyData[currentHourIndex] || hourlyData[0],
                hourly: hourlyData,
            });
        } catch (error) {
            console.error('Weather error:', error);
        } finally {
            setIsWeatherLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWeather();
        db.getFields().then(setFields);
        db.listenToAllUsers(setAllUsers);
        db.listenToAllBookings(setAllBookings);
        db.listenToAllTeams(setAllTeams);
        setLoading(false);
    }, [fetchWeather]);

    useEffect(() => {
        if (user) {
            const latest = allUsers.find(u => u.id === user.id);
            if (latest && JSON.stringify(latest) !== JSON.stringify(user)) {
                setUser(latest);
            }
        }
    }, [allUsers, user]);

    const handleLogin = (email: string, password: string, rememberMe: boolean) => {
        const u = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (u) {
            setUser(u);
            setView(View.HOME);
        }
    };

    const handleLogout = () => {
        setUser(null);
        setView(View.HOME);
    };

    const handleNavigate = (newView: View, options: { isBack?: boolean } = {}) => {
        setAnimationClass(options.isBack ? 'animate-slide-in-from-left' : 'animate-slide-in-from-right');
        setView(newView);
        setViewKey(k => k + 1);
        window.scrollTo(0, 0);
    };

    const handleTabNavigate = (tab: Tab) => {
        setActiveTab(tab);
        const views: Record<Tab, View> = {
            explore: View.HOME,
            community: View.SOCIAL,
            bookings: View.BOOKINGS,
            profile: View.PROFILE
        };
        handleNavigate(views[tab]);
    };

    const handleToggleFavorite = async (id: string) => {
        if (!user) return;
        const favs = user.favoriteFields.includes(id) 
            ? user.favoriteFields.filter(f => f !== id) 
            : [...user.favoriteFields, id];
        await db.updateUser(user.id, { favoriteFields: favs });
    };

    const renderView = () => {
        switch (view) {
            case View.HOME:
                return <Home 
                    onSearch={(l) => handleNavigate(View.SEARCH_RESULTS)} 
                    onSelectField={(f) => { setSelectedField(f); handleNavigate(View.FIELD_DETAIL); }} 
                    fields={fields} loading={loading} favoriteFields={user?.favoriteFields || []} 
                    onToggleFavorite={handleToggleFavorite} user={user} weatherData={weatherData}
                    allBookings={allBookings} currentTime={currentTime} 
                    onSelectBooking={(b) => { setSelectedBooking(b); handleNavigate(View.BOOKING_DETAIL); }}
                    onSearchByLocation={() => {}} isSearchingLocation={false} 
                    isWeatherLoading={isWeatherLoading} onRefreshWeather={fetchWeather} allTeams={allTeams} 
                    acceptedMatches={user?.acceptedMatchInvites || []} 
                />;
            case View.FIELD_DETAIL:
                if (!selectedField) return null;
                return <FieldDetail 
                    complex={{
                        name: selectedField.name, address: selectedField.address, city: selectedField.city, 
                        description: selectedField.description, images: selectedField.images, 
                        services: selectedField.services, fields: [selectedField]
                    }}
                    initialFieldId={selectedField.id}
                    onBookNow={(f, t, d) => { setBookingDetails({ field: f, time: t, date: d }); handleNavigate(View.BOOKING); }}
                    onBack={() => handleNavigate(View.HOME, { isBack: true })}
                    favoriteFields={user?.favoriteFields || []}
                    onToggleFavorite={handleToggleFavorite}
                    weatherData={weatherData} allBookings={allBookings}
                />;
            case View.PROFILE:
                if (!user) return null;
                return <ProfileView 
                    user={user} allTeams={allTeams} setSocialSection={setSocialSection} 
                    onLogout={handleLogout} allFields={fields} onToggleFavorite={handleToggleFavorite}
                    onSelectField={(f) => { setSelectedField(f); handleNavigate(View.FIELD_DETAIL); }}
                    onNavigate={handleNavigate} setIsPremiumModalOpen={setIsPremiumModalOpen}
                    onUpdateProfilePicture={() => {}} onRemoveProfilePicture={() => {}}
                    onUpdateUser={() => {}} onChangePassword={() => {}} 
                    onUpdateNotificationPreferences={() => {}}
                />;
            case View.APPEARANCE:
                return <AppearanceSettings 
                    currentTheme={theme} onUpdateTheme={setTheme} 
                    onBack={() => handleNavigate(View.PROFILE, { isBack: true })}
                    currentAccentColor={accentColor} onUpdateAccentColor={setAccentColor}
                />;
            case View.BOOKINGS:
                return <BookingsView bookings={allBookings.filter(b => b.userId === user?.id)} onSelectBooking={(b) => { setSelectedBooking(b); handleNavigate(View.BOOKING_DETAIL); }} />;
            case View.LOGIN:
                return <Login onLogin={handleLogin} onNavigateToHome={() => setView(View.HOME)} onNavigate={handleNavigate} />;
            case View.SOCIAL:
                if (!user) return null;
                return <SocialView 
                    user={user} allTeams={allTeams} allUsers={allUsers} allBookings={allBookings} 
                    onNavigate={handleNavigate} setIsPremiumModalOpen={setIsPremiumModalOpen} 
                    section={socialSection} setSection={setSocialSection} weatherData={weatherData}
                    onUpdateUserTeams={() => Promise.resolve()} onUpdateTeam={() => Promise.resolve()} 
                    sentInvitations={[]} onSendInvitation={() => {}} onCancelInvitation={() => {}} 
                    onRemovePlayerFromTeam={() => {}} onLeaveTeam={() => {}} onSetAvailability={() => Promise.resolve()}
                    addNotification={() => {}}
                />;
            default:
                return <div className="text-center py-20">Vista en desarrollo</div>;
        }
    };

    const isSocialView = view === View.SOCIAL;
    const isChatView = isSocialView && socialSection === 'chat';
    const showDarkSocialBg = isSocialView && ['hub', 'my-team', 'available-today'].includes(socialSection);

    return (
        <div className={`min-h-screen transition-colors duration-300 ${showDarkSocialBg ? 'bg-bgMain text-white' : 'bg-white dark:bg-bgMain'}`}>
            <Header user={user} onNavigate={handleNavigate} onLogout={handleLogout} notifications={[]} invitations={[]} onDismiss={() => {}} onMarkAllAsRead={() => {}} onClearAll={() => {}} onAcceptInvitation={() => {}} onRejectInvitation={() => {}} onAcceptMatchInvite={() => {}} onRejectMatchInvite={() => {}} currentTime={currentTime} />
            
            <main className={`container mx-auto px-4 py-6 ${isChatView ? 'p-0 max-w-full' : ''}`}>
                <div key={viewKey} className={animationClass}>
                    {renderView()}
                </div>
            </main>

            {!isChatView && user && (
                <BottomNav activeTab={activeTab} onNavigate={handleTabNavigate} />
            )}

            {isPremiumModalOpen && <PremiumLockModal onClose={() => setIsPremiumModalOpen(false)} />}
        </div>
    );
};

export default App;