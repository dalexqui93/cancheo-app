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
    if (isFirebaseConfigured) return null;
    return (
        <div className="bg-yellow-400 text-yellow-900 text-center p-2 font-semibold text-sm sticky top-0 z-[101]">
            <div className="container mx-auto">
                Atención: Firebase no está configurado. La aplicación se ejecutará en modo de demostración. Edita <strong>database.ts</strong>.
            </div>
        </div>
    );
};

const OfflineBanner: React.FC<{ isOnline: boolean }> = ({ isOnline }) => {
    if (isOnline) return null;
    return (
        <div className="bg-gray-700 text-white text-center p-2 font-semibold text-sm sticky top-0 z-[101] animate-fade-in">
            <div className="container mx-auto">Estás desconectado. La aplicación se está ejecutando en modo offline.</div>
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
    const [accentColor, setAccentColor] = useState<AccentColor>(() => (localStorage.getItem('accentColor') as AccentColor) || 'green');
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

    // Lógica de Temas Unificada
    useEffect(() => {
        const root = window.document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const updateTheme = () => {
            const isDark =
                theme === 'dark' ||
                (theme === 'system' && mediaQuery.matches);

            root.classList.toggle('dark', isDark);
            root.classList.toggle('light', !isDark);
            localStorage.setItem('theme', theme);
        };

        updateTheme();
        mediaQuery.addEventListener('change', updateTheme);
        return () => mediaQuery.removeEventListener('change', updateTheme);
    }, [theme]);

    // Accent Color logic
    useEffect(() => {
        const root = window.document.documentElement;
        ['theme-green', 'theme-blue', 'theme-orange', 'theme-purple'].forEach(cls => root.classList.remove(cls));
        root.classList.add(`theme-${accentColor}`);
        localStorage.setItem('accentColor', accentColor);
    }, [accentColor]);

    useEffect(() => {
        const loadInitialStaticData = async () => {
            setLoading(true);
            if (isFirebaseConfigured) await db.seedDatabase();
            const [fieldsData, applicationsData, announcementsData] = await Promise.all([
                db.getFields(),
                db.getOwnerApplications(),
                db.getAnnouncements(),
            ]);
            setFields(fieldsData);
            setOwnerApplications(applicationsData);
            setAnnouncements(announcementsData);
            setLoading(false);
        };
        loadInitialStaticData();
    }, []);

    useEffect(() => {
        let unsubscribeUsers = () => {};
        let unsubscribeBookings = () => {};
        let unsubscribeTeams = () => {};
        if (isFirebaseConfigured) {
            unsubscribeUsers = db.listenToAllUsers(setAllUsers);
            unsubscribeBookings = db.listenToAllBookings(setAllBookings);
            unsubscribeTeams = db.listenToAllTeams(setAllTeams);
        } else {
            db.getUsers().then(setAllUsers);
            db.getAllBookings().then(setAllBookings);
            db.getTeams().then(setAllTeams);
        }
        return () => {
            unsubscribeUsers();
            unsubscribeBookings();
            unsubscribeTeams();
        };
    }, []);

    const handleLogin = (email: string, password: string, rememberMe: boolean) => {
        const loggedInUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (loggedInUser) {
            if (rememberMe) localStorage.setItem('rememberedUserId', loggedInUser.id);
            else localStorage.removeItem('rememberedUserId');
            const updatedUser = loggedInUser.isAdmin ? { ...loggedInUser, isPremium: true } : loggedInUser;
            setUser(updatedUser);
            setNotifications(updatedUser.notifications || []);
            handleNavigate(updatedUser.isAdmin ? View.SUPER_ADMIN_DASHBOARD : (updatedUser.isOwner ? View.OWNER_DASHBOARD : View.HOME));
        } else {
             showToast({ type: 'error', title: 'Error', message: `Correo o contraseña incorrectos.` });
        }
    };

    const handleNavigate = (newView: View, options: { isBack?: boolean; isTab?: boolean } = {}) => {
        setAnimationClass(options.isTab ? 'animate-fade-in' : (options.isBack ? 'animate-slide-in-from-left' : 'animate-slide-in-from-right'));
        setView(newView);
        setViewKey(prev => prev + 1);
        window.scrollTo(0, 0);
        if (!options.isTab) {
            if ([View.HOME, View.SEARCH_RESULTS, View.FIELD_DETAIL].includes(newView)) setActiveTab('explore');
            else if ([View.BOOKINGS, View.BOOKING_DETAIL].includes(newView)) setActiveTab('bookings');
            else if ([View.SOCIAL, View.PLAYER_PROFILE_CREATOR].includes(newView)) setActiveTab('community');
            else if ([View.PROFILE, View.APPEARANCE, View.HELP_SUPPORT, View.PAYMENT_METHODS].includes(newView)) setActiveTab('profile');
        }
    };

    const handleTabNavigate = (tab: Tab) => {
        setActiveTab(tab);
        if (!user && tab !== 'explore') {
            handleNavigate(View.LOGIN);
            return;
        }
        const navOptions = { isTab: true };
        switch (tab) {
            case 'explore': handleNavigate(View.HOME, navOptions); break;
            case 'community': handleNavigate(View.SOCIAL, navOptions); setSocialSection('hub'); break;
            case 'bookings': handleNavigate(View.BOOKINGS, navOptions); break;
            case 'profile': handleNavigate(View.PROFILE, navOptions); break;
        }
    };

    const handleSearch = (location: string) => {
        const searchLocation = location.toLowerCase();
        const results = fields.filter(field =>
            field.name.toLowerCase().includes(searchLocation) || field.city.toLowerCase().includes(searchLocation)
        );
        setSearchResults(results);
        handleNavigate(View.SEARCH_RESULTS);
    };

    const handleSelectField = (field: SoccerField) => { setSelectedField(field); handleNavigate(View.FIELD_DETAIL); };
    const handleBookNow = (field: SoccerField, time: string, date: Date) => {
        if (!user) { handleNavigate(View.LOGIN); return; }
        setBookingDetails({ field, time, date });
        handleNavigate(View.BOOKING);
    };

    const handleConfirmBooking = async (booking: any) => {
        setIsBookingLoading(true);
        try {
            const newBooking = await db.addBooking({ ...booking, userId: user?.id, userName: user?.name, status: 'confirmed' });
            setConfirmedBooking(newBooking);
            handleNavigate(View.BOOKING_CONFIRMATION);
        } catch (e) { console.error(e); } finally { setIsBookingLoading(false); }
    };

    const handleToggleFavorite = async (id: string) => {
        if (!user) return;
        const newFavs = user.favoriteFields.includes(id) ? user.favoriteFields.filter(f => f !== id) : [...user.favoriteFields, id];
        await db.updateUser(user.id, { favoriteFields: newFavs });
    };

    const handleLogout = () => { setUser(null); handleNavigate(View.HOME); };
    const handleUpdateTheme = (newTheme: Theme) => setTheme(newTheme);
    const handleUpdateAccentColor = (newColor: AccentColor) => setAccentColor(newColor);
    const showToast = (notif: any) => setToasts(prev => [...prev, { ...notif, id: Date.now() }]);
    const dismissToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

    const renderView = () => {
        const homeComp = <Home onSearch={handleSearch} onSelectField={handleSelectField} fields={fields} loading={loading} favoriteFields={user?.favoriteFields || []} onToggleFavorite={handleToggleFavorite} user={user} onSearchByLocation={() => {}} isSearchingLocation={false} weatherData={weatherData} isWeatherLoading={isWeatherLoading} onRefreshWeather={() => {}} allBookings={allBookings} allTeams={allTeams} currentTime={currentTime} acceptedMatches={[]} onSelectBooking={() => {}} />;
        switch (view) {
            case View.SEARCH_RESULTS: return <SearchResults fields={searchResults} onSelectField={handleSelectField} onBack={() => handleNavigate(View.HOME, { isBack: true })} favoriteFields={user?.favoriteFields || []} onToggleFavorite={handleToggleFavorite} theme={theme} />;
            case View.FIELD_DETAIL: return selectedField ? <FieldDetail complex={{...selectedField, fields: [selectedField], name: selectedField.name.split(' - ')[0]}} initialFieldId={selectedField.id} onBookNow={handleBookNow} onBack={() => handleNavigate(View.HOME, { isBack: true })} favoriteFields={user?.favoriteFields || []} onToggleFavorite={handleToggleFavorite} allBookings={allBookings} weatherData={weatherData} /> : homeComp;
            case View.LOGIN: return <Login onLogin={handleLogin} onNavigateToHome={() => handleNavigate(View.HOME)} onNavigate={handleNavigate} />;
            case View.PROFILE: return user ? <ProfileView user={user} allTeams={allTeams} setSocialSection={setSocialSection} onLogout={handleLogout} allFields={fields} onToggleFavorite={handleToggleFavorite} onSelectField={handleSelectField} onUpdateProfilePicture={() => {}} onRemoveProfilePicture={() => {}} onUpdateUser={() => {}} onChangePassword={() => {}} onUpdateNotificationPreferences={() => {}} onNavigate={handleNavigate} setIsPremiumModalOpen={setIsPremiumModalOpen} /> : <Login onLogin={handleLogin} onNavigateToHome={() => handleNavigate(View.HOME)} onNavigate={handleNavigate} />;
            case View.APPEARANCE: return <AppearanceSettings currentTheme={theme} onUpdateTheme={handleUpdateTheme} onBack={() => handleNavigate(View.PROFILE, { isBack: true })} currentAccentColor={accentColor} onUpdateAccentColor={handleUpdateAccentColor} />;
            case View.BOOKINGS: return <BookingsView bookings={bookings} onSelectBooking={handleSelectBooking} />;
            default: return homeComp;
        }
    };

    const handleSelectBooking = (b: any) => { setSelectedBooking(b); handleNavigate(View.BOOKING_DETAIL); };

    const showHeader = ![View.LOGIN, View.REGISTER, View.FORGOT_PASSWORD, View.PLAYER_PROFILE_CREATOR].includes(view);
    const showBottomNav = user && !isFullscreenView(view);
    function isFullscreenView(v: View) { return [View.LOGIN, View.REGISTER, View.FORGOT_PASSWORD].includes(v); }

    return (
        <div className="bg-bgMain-light dark:bg-bgMain-dark min-h-screen transition-colors duration-300">
            <FirebaseWarningBanner />
            <OfflineBanner isOnline={isOnline} />
            {showHeader && <Header user={user} onNavigate={handleNavigate} onLogout={handleLogout} notifications={notifications} invitations={receivedInvitations} onDismiss={() => {}} onMarkAllAsRead={() => {}} onClearAll={() => {}} onAcceptInvitation={() => {}} onRejectInvitation={() => {}} onAcceptMatchInvite={() => {}} onRejectMatchInvite={() => {}} currentTime={currentTime}/>}
            <main className={`container mx-auto px-4 py-6 ${showBottomNav ? 'pb-28' : ''}`}>
                <div key={viewKey} className={animationClass}>{renderView()}</div>
            </main>
            {showBottomNav && <BottomNav activeTab={activeTab} onNavigate={handleTabNavigate} />}
            <NotificationContainer notifications={toasts} onDismiss={dismissToast} />
            {isPremiumModalOpen && <PremiumLockModal onClose={() => setIsPremiumModalOpen(false)} />}
        </div>
    );
};

export default App;
