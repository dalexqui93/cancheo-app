
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// FIX: Corrected type imports by fixing the types.ts file.
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
// Fix: Corrected import path from './firebase' to './database' to resolve module not found error.
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
                Atención: Firebase no está configurado. La aplicación se ejecuta en modo de demostración. Edita <strong>database.ts</strong>.
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

// Sonido de notificación en formato Base64 para ser auto-contenido
const notificationSound = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAB3amZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZm';

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

    // Weather State
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);
    const [weatherError, setWeatherError] = useState<string | null>(null);

    // FIX: Define memoized values for owner fields and bookings to be used in the OwnerDashboard.
    const ownerFields = useMemo(() => {
        if (!user || !user.isOwner) return [];
        return fields.filter(field => field.ownerId === user.id);
    }, [user, fields]);

    const ownerBookings = useMemo(() => {
        if (!user || !user.isOwner) return [];
        const ownerFieldIds = new Set(fields.filter(field => field.ownerId === user.id).map(f => f.id));
        return allBookings.filter(booking => booking.field && ownerFieldIds.has(booking.field.id));
    }, [user, fields, allBookings]);

    // Online status listener
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Centralized time management
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);


    // Solicitar permiso para notificaciones al cargar la app
    useEffect(() => {
        if ('Notification' in window) {
            if (window.Notification.permission === 'default') {
                window.Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        console.log('Permiso para notificaciones concedido.');
                    } else {
                        console.log('Permiso para notificaciones denegado.');
                    }
                });
            }
        }
    }, []);
    
    // Load initial static data
    useEffect(() => {
        const loadInitialStaticData = async () => {
            setLoading(true);

            if (isFirebaseConfigured) {
                await db.seedDatabase();
            }

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

    // Real-time data listeners for collections
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

    // Keep logged-in user object in sync with the allUsers list
    useEffect(() => {
        if (user) {
            const latestUserData = allUsers.find(u => u.id === user.id);
            if (latestUserData && JSON.stringify(latestUserData) !== JSON.stringify(user)) {
                setUser(latestUserData);
            }
        }
    }, [allUsers, user]);

    // Invitation listeners
    useEffect(() => {
        if (user && db.isFirebaseConfigured) {
            const unsubscribe = db.listenToInvitationsForUser(user.id, setReceivedInvitations);
            return () => unsubscribe();
        } else if (user) {
            db.getInvitationsForUser(user.id).then(setReceivedInvitations);
        } else {
            setReceivedInvitations([]);
        }
    }, [user]);

    useEffect(() => {
        if (user && allTeams.length > 0) {
            const captainedTeamIds = allTeams.filter(t => t.captainId === user.id).map(t => t.id);
            if (captainedTeamIds.length > 0 && db.isFirebaseConfigured) {
                const unsubscribe = db.listenToInvitationsByTeams(captainedTeamIds, setSentInvitations);
                return () => unsubscribe();
            } else if (captainedTeamIds.length > 0) {
                db.getInvitationsByTeams(captainedTeamIds).then(setSentInvitations);
            } else {
                setSentInvitations([]);
            }
        } else {
            setSentInvitations([]);
        }
    }, [user, allTeams]);


    const fetchWeather = useCallback(async () => {
        setIsWeatherLoading(true);
        setWeatherError(null);

        const processWeatherData = (data: any): Omit<WeatherData, 'locationName'> => {
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

            return {
                latitude: data.latitude,
                longitude: data.longitude,
                timezone: data.timezone,
                lastUpdated: new Date(),
                current: hourlyData[currentHourIndex] || hourlyData[0],
                hourly: hourlyData,
            };
        };

        try {
            const position = await getCurrentPosition({ timeout: 10000, maximumAge: 3600000 });
            const { latitude, longitude } = position.coords;

            // Fetch location name
            let locationName: string | undefined;
            try {
                const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                if (geoResponse.ok) {
                    const geoData = await geoResponse.json();
                    locationName = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.state;
                }
            } catch (geoError) {
                console.warn('No se pudo obtener el nombre de la ubicación para el clima:', geoError);
            }

            const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weathercode&hourly=temperature_2m,apparent_temperature,precipitation_probability,weathercode,windspeed_10m&timezone=auto`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('La respuesta de la red no fue correcta');
            const data = await response.json();
            const processedData = processWeatherData(data);

            const finalWeatherData: WeatherData = {
                ...processedData,
                locationName,
            };

            setWeatherData(finalWeatherData);
            localStorage.setItem('weatherCache', JSON.stringify(finalWeatherData));
        } catch (error) {
            console.warn('Error al obtener el clima, usando fallback/cache:', error);
            const cachedData = localStorage.getItem('weatherCache');
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                // Asegúrate de que las cadenas de fecha se conviertan de nuevo en objetos Date
                parsedData.lastUpdated = new Date(parsedData.lastUpdated);
                parsedData.current.time = new Date(parsedData.current.time);
                parsedData.hourly = parsedData.hourly.map((h: any) => ({...h, time: new Date(h.time)}));
                setWeatherData(parsedData);
            } else {
                setWeatherError("No se pudo cargar el clima.");
            }
        } finally {
            setIsWeatherLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWeather();
        // Configurar un intervalo para actualizar el clima cada 30 minutos
        const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000);

        return () => {
            clearInterval(weatherInterval);
        };
    }, [fetchWeather]);

    // Load user-specific data when user logs in or allBookings change
    useEffect(() => {
        const loadUserData = async () => {
            if (user) {
                const userBookings = allBookings.filter(b => b.userId === user.id);
                setBookings(userBookings);
            } else {
                setBookings([]); // Clear bookings on logout
            }
        };
        loadUserData();
    }, [user, allBookings]);


    // Manage theme changes
    useEffect(() => {
        const root = window.document.documentElement;
        const isDark =
            theme === 'dark' ||
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        root.classList.toggle('dark', isDark);
        localStorage.setItem('theme', theme);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                root.classList.toggle('dark', mediaQuery.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Manage accent color changes
    useEffect(() => {
        const root = window.document.documentElement;
        // Remove old theme classes if any
        ['theme-green', 'theme-blue', 'theme-orange', 'theme-purple'].forEach(cls => root.classList.remove(cls));
        // Add the new one
        root.classList.add(`theme-${accentColor}`);
        localStorage.setItem('accentColor', accentColor);
    }, [accentColor]);


    const playNotificationSound = useCallback(() => {
        try {
            const audio = new Audio(notificationSound);
            audio.play();
        } catch (error) {
            // Fix: Explicitly convert error to string for consistent and safe logging.
            console.error('Error al reproducir sonido de notificación:', String(error));
        }
    }, []);

    const addPersistentNotification = useCallback(async (notif: Omit<Notification, 'id' | 'timestamp'>) => {
        // Mostrar notificación nativa si la app está en segundo plano
        if ('Notification' in window && window.Notification.permission === 'granted' && document.hidden) {
            new window.Notification(notif.title, {
                body: notif.message,
                icon: 'https://ideogram.ai/assets/image/lossless/response/zjy_oza2RB2xuDygg3HR-Q'
            });
            playNotificationSound();
        }

        const newNotification: Notification = { 
            ...notif, 
            id: Date.now(), 
            timestamp: new Date(),
            read: false, 
        };
        
        setNotifications(prev => [newNotification, ...prev]);
    
        if (user && isFirebaseConfigured) {
            try {
                const updatedNotifications = [newNotification, ...(user.notifications || [])];
                const notificationsToSave = updatedNotifications.slice(0, 50);

                await db.updateUser(user.id, { notifications: notificationsToSave });
                
                const updatedUser = { ...user, notifications: notificationsToSave };
                setUser(updatedUser);
                setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
            } catch (error) {
                // Fix: Explicitly convert 'unknown' error to string for safe logging.
                console.error('Error saving notification to database:', String(error));
            }
        }
    }, [user, playNotificationSound]);

    const showToast = useCallback((notif: Omit<Notification, 'id' | 'timestamp'>) => {
        const newToast: Notification = {
            ...notif,
            id: Date.now(),
            timestamp: new Date()
        };
        setToasts(prev => [newToast, ...prev]);
    }, []);
    
    // Simulate push notifications for favorite fields
    useEffect(() => {
        if (!user) return;
        const notificationSimulator = setInterval(() => {
            if (user.isOwner || !user.favoriteFields.length || !fields.length) return;

            const shouldTrigger = Math.random() < 0.1; // 10% chance every 20 seconds
            if (!shouldTrigger) return;
            
            const randomFavComplexId = user.favoriteFields[Math.floor(Math.random() * user.favoriteFields.length)];
            const field = fields.find(f => (f.complexId || f.id) === randomFavComplexId);
            if (!field) return;

            const notificationType = Math.random(); // 0 to 1

            if (notificationType < 0.33 && user.notificationPreferences?.importantNews) {
                addPersistentNotification({
                    type: 'info',
                    title: 'Anuncio Importante',
                    message: `${field.name.split(' - ')[0]} anuncia un torneo de verano. ¡Inscripciones abiertas!`
                });
            } else if (notificationType < 0.66 && user.notificationPreferences?.specialDiscounts) {
                addPersistentNotification({
                    type: 'info',
                    title: '¡Oferta Especial!',
                    message: `¡${field.name.split(' - ')[0]} tiene un 15% de descuento en reservas nocturnas esta semana!`
                });
            } else if (user.notificationPreferences?.newAvailability) {
                addPersistentNotification({
                    type: 'info',
                    title: '¡Nueva Disponibilidad!',
                    message: `Se ha abierto un nuevo horario a las 20:00 en ${field.name.split(' - ')[0]} para mañana.`
                });
            }

        }, 20000); // Check every 20 seconds

        return () => clearInterval(notificationSimulator);
    }, [user, fields, addPersistentNotification]);

    const dismissNotification = useCallback(async (id: number) => {
        const originalNotifications = notifications;
        const updatedNotifications = originalNotifications.filter(n => n.id !== id);
        setNotifications(updatedNotifications);
    
        if (user && isFirebaseConfigured) {
            try {
                await db.updateUser(user.id, { notifications: updatedNotifications });
                
                const updatedUser = { ...user, notifications: updatedNotifications };
                setUser(updatedUser);
                setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
            } catch (error) {
                // Fix: Explicitly convert 'unknown' error to string for safe logging.
                console.error('Error deleting notification from database:', String(error));
                // Revert state on failure
                setNotifications(originalNotifications);
                showToast({
                    type: 'error',
                    title: 'Error de Sincronización',
                    message: 'No se pudo eliminar la notificación. Inténtalo de nuevo.'
                });
            }
        }
    }, [user, notifications, showToast]);

    const handleMarkAllNotificationsAsRead = async () => {
        if (!user || !notifications.some(n => !n.read)) return;
    
        const originalNotifications = notifications;
        const updatedNotifications = originalNotifications.map(n => ({ ...n, read: true }));
        setNotifications(updatedNotifications);
    
        if (isFirebaseConfigured) {
            try {
                await db.updateUser(user.id, { notifications: updatedNotifications });
                const updatedUser = { ...user, notifications: updatedNotifications };
                setUser(updatedUser);
                setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
            } catch (error) {
                // FIX: In a catch block, 'error' is of type 'unknown'. Explicitly convert it to a string for safe logging.
                console.error('Error marking notifications as read:', String(error));
                setNotifications(originalNotifications); // Revert on error
            }
        }
    };
    
    const handleClearNotifications = async () => {
        if (!user || notifications.length === 0) return;
    
        const originalNotifications = notifications;
        setNotifications([]);
    
        if (isFirebaseConfigured) {
            try {
                await db.updateUser(user.id, { notifications: [] });
                const updatedUser = { ...user, notifications: [] };
                setUser(updatedUser);
                setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
            } catch (error) {
                // Fix: Explicitly convert error to string for consistent and safe logging.
                console.error('Error clearing notifications:', String(error));
                setNotifications(originalNotifications); // Revert on error
            }
        }
    };

    const dismissToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };
    
    // Reminder notification checker
    useEffect(() => {
        const checkBookingReminders = async () => {
            if (!bookings.length) return;
    
            const now = new Date();
            const bookingsToUpdate: ConfirmedBooking[] = [];
    
            for (const booking of bookings) {
                if (booking.status !== 'confirmed') continue;
    
                const bookingDate = new Date(booking.date);
                const [hours, minutes] = booking.time.split(':').map(Number);
                bookingDate.setHours(hours, minutes, 0, 0);
    
                if (bookingDate < now) continue;
    
                const hoursUntil = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
                let reminderSent = false;
                const updatedBooking = { ...booking };
                if (!updatedBooking.remindersSent) {
                    updatedBooking.remindersSent = { twentyFourHour: false, oneHour: false };
                }
    
                if (hoursUntil > 1 && hoursUntil <= 24 && !updatedBooking.remindersSent.twentyFourHour) {
                    addPersistentNotification({ type: 'info', title: 'Recordatorio de Reserva', message: `Tu partido en ${booking.field.name} es mañana a las ${booking.time}.` });
                    updatedBooking.remindersSent.twentyFourHour = true;
                    reminderSent = true;
                }
    
                if (hoursUntil > 0 && hoursUntil <= 1 && !updatedBooking.remindersSent.oneHour) {
                    addPersistentNotification({ type: 'info', title: '¡Tu partido es pronto!', message: `Tu reserva en ${booking.field.name} es en aproximadamente una hora.` });
                    updatedBooking.remindersSent.oneHour = true;
                    reminderSent = true;
                }
    
                if (reminderSent) {
                    await db.updateBooking(updatedBooking.id, { remindersSent: updatedBooking.remindersSent });
                    bookingsToUpdate.push(updatedBooking);
                }
            }
    
            if (bookingsToUpdate.length > 0) {
                setAllBookings(prevAllBookings => {
                    const updatedMap = new Map(bookingsToUpdate.map(b => [b.id, b]));
                    return prevAllBookings.map(b => updatedMap.get(b.id) || b);
                });
            }
        };
    
        const intervalId = setInterval(checkBookingReminders, 60000); // Check every minute
        checkBookingReminders();
    
        return () => clearInterval(intervalId);
    }, [bookings, addPersistentNotification]);
    
    // Automatically mark past bookings as 'completed'
    useEffect(() => {
        const completePastBookings = async () => {
            const now = new Date();
            const bookingsToComplete: ConfirmedBooking[] = [];
    
            allBookings.forEach(booking => {
                if (booking.status === 'confirmed') {
                    const bookingDateTime = new Date(booking.date);
                    const [hours, minutes] = booking.time.split(':').map(Number);
                    bookingDateTime.setHours(hours, minutes);
    
                    // Mark as completed 2 hours after start time for scorekeeping flexibility
                    const twoHoursAfterStart = bookingDateTime.getTime() + 2 * 60 * 60 * 1000;
                    if (now.getTime() > twoHoursAfterStart) {
                        bookingsToComplete.push(booking);
                    }
                }
            });
    
            if (bookingsToComplete.length > 0) {
                const updates = bookingsToComplete.map(b => 
                    db.updateBooking(b.id, { status: 'completed' })
                );
                await Promise.all(updates);
    
                setAllBookings(prevAllBookings => {
                    const completedIds = new Set(bookingsToComplete.map(b => b.id));
                    return prevAllBookings.map(b =>
                        completedIds.has(b.id) ? { ...b, status: 'completed' } : b
                    );
                });
            }
        };
    
        const intervalId = setInterval(completePastBookings, 60 * 1000); // Run every minute
        completePastBookings(); // Run once on load
    
        return () => clearInterval(intervalId);
    }, [allBookings]);

    // Loyalty Program Check - now triggers on completed bookings
    useEffect(() => {
        if (!user || loading || rewardInfo || ratingInfo) return;

        const checkLoyaltyForCompletedGames = async () => {
            const completedBookings = bookings.filter(b =>
                b.userId === user.id &&
                b.status === 'completed' &&
                !b.loyaltyApplied
            );

            if (completedBookings.length > 0) {
                let newLoyalty: UserLoyalty = user.loyalty ? JSON.parse(JSON.stringify(user.loyalty)) : {};
                let loyaltyWasUpdated = false;

                for (const booking of completedBookings) {
                    if (!booking.field.loyaltyEnabled) continue;

                    const fieldId = booking.field.id;
                    const loyaltyGoal = booking.field.loyaltyGoal || 7;

                    if (!newLoyalty[fieldId]) {
                        newLoyalty[fieldId] = { progress: 0, freeTickets: 0 };
                    }

                    newLoyalty[fieldId].progress++;
                    loyaltyWasUpdated = true;

                    if (newLoyalty[fieldId].progress >= loyaltyGoal) {
                        newLoyalty[fieldId].progress = 0;
                        newLoyalty[fieldId].freeTickets++;
                        setRewardInfo({ field: booking.field });
                        addPersistentNotification({
                            type: 'success',
                            title: '¡Cancha Gratis!',
                            message: `¡Completaste ${loyaltyGoal} reservas en ${booking.field.name}! Acabas de ganar un ticket para una cancha gratis en este lugar.`
                        });
                    }
                }

                if (loyaltyWasUpdated) {
                    await db.updateUser(user.id, { loyalty: newLoyalty });
                    const updatedUser = { ...user, loyalty: newLoyalty };
                    setUser(updatedUser);
                    setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
                }

                const completedBookingIds = new Set(completedBookings.map(b => b.id));
                for (const bookingId of completedBookingIds) {
                    await db.updateBooking(bookingId, { loyaltyApplied: true });
                }
                
                setAllBookings(prevBookings =>
                    prevBookings.map(b =>
                        completedBookingIds.has(b.id) ? { ...b, loyaltyApplied: true } : b
                    )
                );
            }
        };

        checkLoyaltyForCompletedGames();
    }, [user, allBookings, bookings, loading, addPersistentNotification, rewardInfo, ratingInfo]);

    // Check for remembered user on app load
    useEffect(() => {
        if (loading || user) return; // Don't run if data is loading or a user is already logged in

        const rememberedUserId = localStorage.getItem('rememberedUserId');
        if (rememberedUserId && allUsers.length > 0) {
            const rememberedUser = allUsers.find(u => u.id === rememberedUserId);
            if (rememberedUser) {
                setUser(rememberedUser);
                setNotifications(rememberedUser.notifications?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) || []);
                showToast({
                    type: 'info',
                    title: 'Sesión Restaurada',
                    message: `¡Hola de nuevo, ${rememberedUser.name}!`
                });
            } else {
                // Clean up if the user ID is invalid
                localStorage.removeItem('rememberedUserId');
            }
        }
    }, [allUsers, loading, user, showToast]);

    const handleLogin = (email: string, password: string, rememberMe: boolean) => {
        const loggedInUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
        if (loggedInUser) {
            if (rememberMe) {
                localStorage.setItem('rememberedUserId', loggedInUser.id);
            } else {
                localStorage.removeItem('rememberedUserId');
            }

            setUser(loggedInUser);
            const sortedNotifications = (loggedInUser.notifications || []).filter(n => n.timestamp instanceof Date || !isNaN(new Date(n.timestamp).getTime())).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setNotifications(sortedNotifications);
            showToast({
                type: 'success',
                title: 'Inicio de sesión exitoso',
                message: `¡Bienvenido, ${loggedInUser.name}!`
            });

            if (loggedInUser.isAdmin) {
                handleNavigate(View.SUPER_ADMIN_DASHBOARD);
            } else if (loggedInUser.isOwner && loggedInUser.ownerStatus === 'approved') {
                handleNavigate(View.OWNER_DASHBOARD);
            } else {
                handleNavigate(View.HOME);
            }
        } else {
             showToast({
                type: 'error',
                title: 'Error de inicio de sesión',
                message: `Correo o contraseña incorrectos.`
            });
        }
    };

    const handleRegister = async (newUserData: Omit<User, 'id' | 'favoriteFields' | 'isPremium' | 'playerProfile' | 'isAdmin'>) => {
        setIsRegisterLoading(true);
        try {
            const newUser: Omit<User, 'id'> = {
                ...newUserData,
                isOwner: false,
                isAdmin: false,
                isPremium: false,
                favoriteFields: [],
                cancheoCoins: 100, // Starting bonus
            };
            const createdUser = await db.addUser(newUser);
            setUser(createdUser);
            setAllUsers(prev => [...prev, createdUser]);
            handleNavigate(View.HOME);
            showToast({
                type: 'success',
                title: '¡Bienvenido!',
                message: `Tu cuenta ha sido creada exitosamente, ${createdUser.name}.`
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'DUPLICATE_EMAIL') {
                showToast({
                    type: 'error',
                    title: 'Error de Registro',
                    message: 'Ya existe una cuenta con este correo electrónico.'
                });
            } else {
                showToast({
                    type: 'error',
                    title: 'Error Inesperado',
                    message: 'No se pudo crear la cuenta. Inténtalo de nuevo.'
                });
                // Fix: The 'error' object is of type 'unknown' in a catch block.
                // Accessing properties like 'message' directly is unsafe and causes a type error.
                // We must first check if it's an instance of Error before accessing 'message',
                // otherwise, we convert it to a string for safe logging.
                // Fix: Explicitly convert error to string for consistent and safe logging.
                console.error('Registration error:', String(error));
            }
        } finally {
            setIsRegisterLoading(false);
        }
    };
    
    const handleOwnerRegister = async (applicationData: Omit<OwnerApplication, 'id' | 'userId' | 'status' | 'userName' | 'userEmail'>, userData: Omit<User, 'id' | 'isOwner' | 'isAdmin' | 'favoriteFields' | 'isPremium' | 'playerProfile'>) => {
        setIsOwnerRegisterLoading(true);
        try {
            const tempUser: Omit<User, 'id'> = {
                ...userData,
                isOwner: false,
                isAdmin: false,
                isPremium: false,
                favoriteFields: [],
                ownerStatus: 'pending',
            };
            const newUser = await db.addUser(tempUser);
            
            const newApplicationData: Omit<OwnerApplication, 'id'> = {
                ...applicationData,
                userId: newUser.id,
                userName: newUser.name,
                userEmail: newUser.email,
                status: 'pending',
            };

            const newApplication = await db.addOwnerApplication(newApplicationData);

            setAllUsers(prev => [...prev, newUser]);
            setOwnerApplications(prev => [...prev, newApplication]);

            addPersistentNotification({
                type: 'success',
                title: 'Solicitud Recibida',
                message: `Gracias ${newUser.name}, hemos recibido tu solicitud y la revisaremos pronto.`,
            });

            handleNavigate(View.OWNER_PENDING_VERIFICATION);
        } catch (error) {
            if (error instanceof Error && error.message === 'DUPLICATE_EMAIL') {
                showToast({
                    type: 'error',
                    title: 'Error de Registro',
                    message: 'Ya existe una cuenta con este correo electrónico.'
                });
            } else {
                showToast({
                    type: 'error',
                    title: 'Error Inesperado',
                    message: 'No se pudo crear la cuenta. Inténtalo de nuevo.'
                });
                // Fix: Explicitly convert error to string for consistent and safe logging.
                console.error('Owner registration error:', String(error));
            }
        } finally {
            setIsOwnerRegisterLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('rememberedUserId');
        setUser(null);
        setNotifications([]);
        handleNavigate(View.HOME);
    };

    const handleNavigate = (newView: View, options: { isBack?: boolean; isTab?: boolean } = {}) => {
        if (options.isTab) {
            setAnimationClass('animate-fade-in');
        } else if (options.isBack) {
            setAnimationClass('animate-slide-in-from-left');
        } else {
            setAnimationClass('animate-slide-in-from-right');
        }
        
        setView(newView);
        setViewKey(prev => prev + 1); // Force re-render with new animation
        window.scrollTo(0, 0);

        // Update active tab based on view
        if (options.isTab) {
            // Tab is already handled by handleTabNavigate
        } else {
             if ([View.HOME, View.SEARCH_RESULTS, View.FIELD_DETAIL].includes(newView)) setActiveTab('explore');
            else if ([View.BOOKINGS, View.BOOKING_DETAIL].includes(newView)) setActiveTab('bookings');
            else if ([View.SOCIAL, View.PLAYER_PROFILE_CREATOR].includes(newView)) setActiveTab('community');
            else if ([View.PROFILE, View.APPEARANCE, View.HELP_SUPPORT, View.PAYMENT_METHODS].includes(newView)) setActiveTab('profile');
        }
    };
    
    const handleTabNavigate = (tab: Tab) => {
        setActiveTab(tab);
        const navOptions = { isTab: true };
        switch (tab) {
            case 'explore':
                handleNavigate(View.HOME, navOptions);
                break;
            case 'community':
                if (!user) {
                    handleNavigate(View.LOGIN);
                    showToast({ type: 'info', title: 'Inicia sesión', message: 'Debes iniciar sesión para acceder a DaviPlay.' });
                } else {
                    handleNavigate(View.SOCIAL, navOptions);
                    setSocialSection('hub');
                }
                break;
            case 'bookings':
                if (!user) {
                    handleNavigate(View.LOGIN);
                    showToast({ type: 'info', title: 'Inicia sesión', message: 'Debes iniciar sesión para ver tus reservas.' });
                } else {
                    handleNavigate(View.BOOKINGS, navOptions);
                }
                break;
            case 'profile':
                 if (!user) {
                    handleNavigate(View.LOGIN);
                    showToast({ type: 'info', title: 'Inicia sesión', message: 'Debes iniciar sesión para ver tu perfil.' });
                } else {
                    handleNavigate(View.PROFILE, navOptions);
                }
                break;
        }
    };

    const handleSearch = (location: string, filters?: { size?: '5v5' | '7v7' | '11v11' }) => {
        const searchLocation = location.toLowerCase();
        const results = fields.filter(field =>
            (field.name.toLowerCase().includes(searchLocation) || field.city.toLowerCase().includes(searchLocation)) &&
            (!filters?.size || field.size === filters.size)
        );
        setSearchResults(results);
        handleNavigate(View.SEARCH_RESULTS);
    };

    const handleSearchByLocation = async () => {
        if (!navigator.geolocation) {
            showToast({
                type: 'error',
                title: 'Geolocalización no soportada',
                message: 'Tu dispositivo no soporta esta función.'
            });
            return;
        }
    
        setIsSearchingLocation(true);
    
        try {
            if (navigator.permissions) {
                const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
    
                if (permissionStatus.state === 'denied') {
                    showToast({
                        type: 'error',
                        title: 'Permiso de Ubicación Denegado',
                        message: 'Para usar esta función, activa el permiso de ubicación para "Cancheo" en los ajustes de tu celular.'
                    });
                    setIsSearchingLocation(false);
                    return;
                }
            }
    
            const position = await getCurrentPosition({ timeout: 20000, maximumAge: 60000, enableHighAccuracy: false });
            const { latitude, longitude } = position.coords;
    
            const fieldsWithDistance = fields.map(field => {
                const distance = calculateDistance(latitude, longitude, field.latitude, field.longitude);
                return { ...field, distance };
            });
            
            fieldsWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    
            setSearchResults(fieldsWithDistance);
            handleNavigate(View.SEARCH_RESULTS);
            
        } catch (error) {
            // Fix: Explicitly convert error to string for consistent and safe logging.
            console.error('Error getting location:', String(error));
            let message = 'No se pudo obtener tu ubicación. Asegúrate de que los permisos de ubicación están activados para la aplicación y que el GPS de tu celular está encendido.';
            if (error instanceof GeolocationPositionError) {
                if (error.code === 1) { // PERMISSION_DENIED
                    message = 'Permiso de ubicación denegado. Actívalo en los ajustes de tu celular para usar esta función.';
                } else if (error.code === 2) { // POSITION_UNAVAILABLE
                    message = 'La información de ubicación no está disponible. Revisa que el GPS de tu celular esté activado.';
                } else if (error.code === 3) { // TIMEOUT
                    message = 'Se agotó el tiempo de espera para obtener la ubicación. Intenta de nuevo en un lugar con mejor señal.';
                }
            }
            showToast({
                type: 'error',
                title: 'Error de Ubicación',
                message: message
            });
        } finally {
            setIsSearchingLocation(false);
        }
    };

    const handleSelectField = (field: SoccerField) => {
        setSelectedField(field);
        handleNavigate(View.FIELD_DETAIL);
    };

    const handleBookNow = (field: SoccerField, time: string, date: Date) => {
        if (!user) {
            handleNavigate(View.LOGIN);
            showToast({type: 'info', title: 'Inicia sesión para reservar', message: 'Debes tener una cuenta para poder reservar una cancha.'});
            return;
        }
        setBookingDetails({ field, time, date });
        handleNavigate(View.BOOKING);
    };
    
    const handleConfirmBooking = async (booking: Omit<ConfirmedBooking, 'id' | 'status' | 'userId' | 'userName' | 'userPhone'>) => {
        if (!user) return;
    
        setIsBookingLoading(true);
        try {
            if (booking.isFree) {
                const fieldId = booking.field.id;
                const updatedLoyalty = { ...user.loyalty };
                if (updatedLoyalty[fieldId]) {
                    updatedLoyalty[fieldId].freeTickets -= 1;
                    await db.updateUser(user.id, { loyalty: updatedLoyalty });
                    const updatedUser = { ...user, loyalty: updatedLoyalty };
                    setUser(updatedUser);
                    setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
                }
            }
            
            const bookingData: Omit<ConfirmedBooking, 'id'> = { 
                ...booking, 
                status: 'confirmed',
                userId: user.id,
                userName: user.name,
                userPhone: user.phone,
                remindersSent: { twentyFourHour: false, oneHour: false }
            };
            const newBooking = await db.addBooking(bookingData);
            setConfirmedBooking(newBooking);
            // setAllBookings no es necesario aquí si usamos listeners en tiempo real
            handleNavigate(View.BOOKING_CONFIRMATION);
            addPersistentNotification({type: 'success', title: '¡Reserva confirmada!', message: `Tu reserva en ${booking.field.name} está lista.`});
        } catch (error) {
            // Fix: Explicitly convert error to string for consistent and safe logging.
            console.error('Booking confirmation error:', String(error));
            showToast({
                type: 'error',
                title: 'Error de Reserva',
                message: 'No se pudo confirmar tu reserva. Por favor, inténtalo de nuevo.'
            });
        } finally {
            setIsBookingLoading(false);
        }
    };

    const handleToggleFavorite = async (complexId: string) => {
        if (!user) return;
        const isCurrentlyFavorite = user.favoriteFields.includes(complexId);
        const newFavorites = isCurrentlyFavorite
            ? user.favoriteFields.filter(id => id !== complexId)
            : [...user.favoriteFields, complexId];
        
        await db.updateUser(user.id, { favoriteFields: newFavorites });
        const updatedUser = { ...user, favoriteFields: newFavorites };
        setUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));

        const complexField = fields.find(f => (f.complexId || f.id) === complexId);
        const complexName = complexField ? (complexField.name.split(' - ')[0] || complexField.name) : 'El complejo';

        if (isCurrentlyFavorite) {
            showToast({type: 'info', title: 'Favorito eliminado', message: `${complexName} fue eliminado de tus favoritos.`});
        } else {
             showToast({type: 'success', title: 'Favorito añadido', message: `${complexName} fue añadido a tus favoritos.`});
        }
    };
    
    const handleSelectBooking = (booking: ConfirmedBooking) => {
        setSelectedBooking(booking);
        handleNavigate(View.BOOKING_DETAIL);
    };

    const handleCancelBooking = async (bookingId: string) => {
        const bookingToCancel = bookings.find(b => b.id === bookingId);
        if (bookingToCancel) {
            await db.updateBooking(bookingId, { status: 'cancelled' });
            // El estado se actualizará automáticamente gracias al listener
            
            if (selectedBooking && selectedBooking.id === bookingId) {
                setSelectedBooking({ ...selectedBooking, status: 'cancelled' });
            }

            handleNavigate(View.BOOKINGS, { isBack: true });
            addPersistentNotification({
                type: 'success',
                title: 'Reserva Cancelada',
                message: `Tu reserva en ${bookingToCancel.field.name} ha sido cancelada.`
            });
        }
    };

    const handleUpdateScore = async (bookingId: string, scoreA: number, scoreB: number) => {
        await db.updateBooking(bookingId, { scoreA, scoreB });
        // El estado se actualizará automáticamente gracias al listener
        if (selectedBooking && selectedBooking.id === bookingId) {
            setSelectedBooking(prev => prev ? { ...prev, scoreA, scoreB } : null);
        }
    };

    const handleFinalizeMatch = async (bookingId: string, scoreA: number, scoreB: number) => {
        await db.updateBooking(bookingId, { scoreA, scoreB, status: 'completed' });
        // El estado se actualizará automáticamente gracias al listener
         if (selectedBooking && selectedBooking.id === bookingId) {
            setSelectedBooking(prev => prev ? { ...prev, scoreA, scoreB, status: 'completed' } : null);
        }
        showToast({type: 'success', title: 'Partido Finalizado', message: `El marcador final fue ${scoreA} - ${scoreB}.`});
    };

    const handleUpdateProfilePicture = async (imageDataUrl: string) => {
        if (!user) return;
    
        const updates: { profilePicture: string; 'playerProfile.profilePicture'?: string } = {
            profilePicture: imageDataUrl,
        };
        if (user.playerProfile) {
            updates['playerProfile.profilePicture'] = imageDataUrl;
        }
    
        await db.updateUser(user.id, updates);
    
        const updatedUser = { 
            ...user, 
            profilePicture: imageDataUrl,
            ...(user.playerProfile && { 
                playerProfile: { ...user.playerProfile, profilePicture: imageDataUrl } 
            })
        };
        
        setUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        showToast({ type: 'success', title: 'Foto actualizada', message: 'Tu foto de perfil ha sido guardada.' });
    };
    
    const handleRemoveProfilePicture = async () => {
        if (!user) return;
    
        const fieldsToRemove: (keyof User | string)[] = ['profilePicture'];
        if (user.playerProfile) {
            fieldsToRemove.push('playerProfile.profilePicture');
        }
        await db.removeUserField(user.id, fieldsToRemove);
    
        const { profilePicture, ...restOfUser } = user;
        let updatedUser: User = restOfUser as User;
    
        if (updatedUser.playerProfile) {
            // Create a new player profile object without the profilePicture
            const { profilePicture: playerPP, ...restOfPlayerProfile } = updatedUser.playerProfile;
            updatedUser = { ...updatedUser, playerProfile: restOfPlayerProfile as Player };
        }
    
        setUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        showToast({ type: 'info', title: 'Foto eliminada', message: 'Tu foto de perfil ha sido eliminada.' });
    };
    
    const handleUpdateUserInfo = async (updatedInfo: { name: string; phone?: string }) => {
        if (!user) return;
        await db.updateUser(user.id, updatedInfo);
        const updatedUser = { ...user, ...updatedInfo };
        setUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        showToast({ type: 'success', title: 'Perfil Actualizado', message: 'Tu información personal ha sido guardada.' });
    };
    
    const handleChangePassword = async (currentPassword: string, newPassword: string) => {
        if (!user) return;
    
        if (user.password !== currentPassword) {
            showToast({
                type: 'error',
                title: 'Error de Contraseña',
                message: 'La contraseña actual es incorrecta.'
            });
            return;
        }
    
        try {
            await db.updateUser(user.id, { password: newPassword });
            
            const updatedUser = { ...user, password: newPassword };
            setUser(updatedUser);
            setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));

            showToast({
                type: 'success',
                title: 'Contraseña Actualizada',
                message: 'Tu contraseña ha sido cambiada exitosamente.'
            });
        } catch (error) {
            // Fix: Explicitly convert error to string for consistent and safe logging.
            console.error('Error updating password:', String(error));
            showToast({
                type: 'error',
                title: 'Error Inesperado',
                message: 'No se pudo actualizar tu contraseña. Inténtalo de nuevo.'
            });
        }
    };
    
    const handleUpdateNotificationPreferences = async (prefs: { newAvailability: boolean; specialDiscounts: boolean; importantNews: boolean; }) => {
        if (!user) return;
        await db.updateUser(user.id, { notificationPreferences: prefs });
        const updatedUser = { ...user, notificationPreferences: prefs };
        setUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        showToast({ type: 'success', title: 'Preferencias actualizadas', message: 'Tus ajustes de notificación han sido guardados.' });
    };
    
    const handleUpdateTheme = (newTheme: Theme) => setTheme(newTheme);
    const handleUpdateAccentColor = (newColor: AccentColor) => setAccentColor(newColor);

    const handleAddPaymentMethod = async (method: Omit<PaymentMethod, 'id'>) => {
        if (!user) return;
        const newMethod = { ...method, id: `pm_${Date.now()}` } as PaymentMethod;
        const updatedMethods = [...(user.paymentMethods || []), newMethod];
        if (updatedMethods.filter(m => m.type === 'card').length === 1) {
            const cardIndex = updatedMethods.findIndex(m => m.id === newMethod.id);
            if (cardIndex !== -1) (updatedMethods[cardIndex] as CardPaymentMethod).isDefault = true;
        }
        await db.updateUser(user.id, { paymentMethods: updatedMethods });
        const updatedUser = { ...user, paymentMethods: updatedMethods };
        setUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        showToast({ type: 'success', title: 'Método de pago añadido', message: 'Tu nuevo método de pago ha sido guardado.' });
    };

    const handleDeletePaymentMethod = async (methodId: string) => {
        if (!user) return;
        const updatedMethods = user.paymentMethods?.filter(m => m.id !== methodId) || [];
        await db.updateUser(user.id, { paymentMethods: updatedMethods });
        const updatedUser = { ...user, paymentMethods: updatedMethods };
        setUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        showToast({ type: 'info', title: 'Método de pago eliminado', message: 'El método de pago ha sido eliminado.' });
    };

    const handleSetDefaultPaymentMethod = async (methodId: string) => {
        if (!user || !user.paymentMethods) return;
        const updatedMethods: PaymentMethod[] = user.paymentMethods.map(m => ({ ...m, isDefault: m.id === methodId }));
        await db.updateUser(user.id, { paymentMethods: updatedMethods });
        const updatedUser = { ...user, paymentMethods: updatedMethods };
        setUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        showToast({ type: 'success', title: 'Método predeterminado', message: 'Se ha actualizado tu método de pago principal.' });
    };

    const handleUpdatePlayerProfile = async (updatedProfile: Player) => {
        if (!user) return;
        await db.updateUser(user.id, { playerProfile: updatedProfile });
        const updatedUser = { ...user, playerProfile: updatedProfile };
        setUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        showToast({ type: 'success', title: 'Perfil de Jugador Guardado', message: '¡Tus estadísticas han sido actualizadas!' });
        handleNavigate(View.SOCIAL);
    };

    const handleUpdateUserTeams = async (teamIds: string[]) => {
        if (!user) return;
        try {
            await db.updateUser(user.id, { teamIds });
            const updatedUser = { ...user, teamIds };
            setUser(updatedUser);
            setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        } catch (error) {
            console.error("Error al actualizar los equipos del usuario:", String(error));
            showToast({
                type: 'error',
                title: 'Error de Equipo',
                message: 'No se pudo asignar el equipo a tu perfil.'
            });
        }
    };

    const handleUpdateTeam = async (teamId: string, updates: Partial<Team>) => {
        try {
            await db.updateTeam(teamId, updates);
            if (!isFirebaseConfigured) {
                setAllTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...updates } : t));
            }
        } catch (error) {
            console.error("Error al actualizar el equipo:", String(error));
            showToast({
                type: 'error',
                title: 'Error de Equipo',
                message: 'No se pudieron guardar los cambios en el equipo.'
            });
        }
    };

    const handleRemovePlayerFromTeam = async (teamId: string, playerId: string) => {
        const team = allTeams.find(t => t.id === teamId);
        const userToRemove = allUsers.find(u => u.id === playerId);
    
        if (!team || !userToRemove) {
            showToast({ type: 'error', title: 'Error', message: 'No se pudo encontrar el equipo o el jugador.' });
            return;
        }
    
        const updatedPlayers = team.players.filter(p => p.id !== playerId);
        const updatedTeamIds = userToRemove.teamIds?.filter(id => id !== teamId) || [];
    
        const notificationForRemovedPlayer: Omit<Notification, 'id' | 'timestamp'> = {
            type: 'error',
            title: 'Has sido expulsado del equipo',
            message: `El capitán de "${team.name}" te ha eliminado de la plantilla.`,
            read: false,
        };
        const newNotification = { ...notificationForRemovedPlayer, id: Date.now(), timestamp: new Date() };
        const updatedNotifications = [newNotification, ...(userToRemove.notifications || [])].slice(0, 50);

        const systemMessageData: Omit<SystemMessage, "id" | "timestamp"> = {
            type: 'system',
            text: `${userToRemove.name} ha sido expulsado del equipo por el capitán.`,
        };
    
        try {
            await db.updateTeam(teamId, { players: updatedPlayers });
            await db.updateUser(playerId, { teamIds: updatedTeamIds, notifications: updatedNotifications });
            await db.addChatMessage(teamId, systemMessageData);
    
            if (!isFirebaseConfigured) {
                 setAllTeams(prev => prev.map(t => t.id === teamId ? { ...t, players: updatedPlayers } : t));
            }
    
            setAllUsers(prev => prev.map(u => {
                if (u.id === playerId) {
                    return { ...u, teamIds: updatedTeamIds, notifications: updatedNotifications };
                }
                return u;
            }));
            
            showToast({ type: 'info', title: 'Jugador Expulsado', message: `${userToRemove.name} ha sido eliminado de ${team.name}.` });
    
        } catch (error) {
            console.error("Error al eliminar jugador del equipo:", String(error));
            showToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar al jugador.' });
        }
    };

    const handleLeaveTeam = async (teamId: string) => {
        if (!user) return;
        const team = allTeams.find(t => t.id === teamId);
        if (!team) return;

        const updatedPlayers = team.players.filter(p => p.id !== user.id);
        const updatedTeamIds = user.teamIds?.filter(id => id !== teamId) || [];

        const notificationForCaptain: Omit<Notification, 'id'| 'timestamp'> = {
            type: 'error',
            title: 'Baja en el equipo',
            message: `${user.name} ha abandonado ${team.name}.`,
            read: false
        };
        const newNotification = { ...notificationForCaptain, id: Date.now(), timestamp: new Date() };
        const captain = allUsers.find(u => u.id === team.captainId);
        const updatedCaptainNotifications = [newNotification, ...(captain?.notifications || [])].slice(0, 50);

        const systemMessageData: Omit<SystemMessage, "id" | "timestamp"> = {
            type: 'system',
            text: `${user.name} ha abandonado el equipo.`,
        };

        try {
            await db.updateTeam(teamId, { players: updatedPlayers });
            await db.updateUser(user.id, { teamIds: updatedTeamIds });
            if(captain) {
                await db.updateUser(captain.id, { notifications: updatedCaptainNotifications });
            }
            await db.addChatMessage(teamId, systemMessageData);

            if (!isFirebaseConfigured) {
                setAllTeams(prev => prev.map(t => t.id === teamId ? { ...t, players: updatedPlayers } : t));
            }
    
            const updatedUser = { ...user, teamIds: updatedTeamIds };
            setUser(updatedUser);
            setAllUsers(prev => prev.map(u => {
                if (u.id === user.id) return updatedUser;
                if (captain && u.id === captain.id) return { ...u, notifications: updatedCaptainNotifications };
                return u;
            }));

            showToast({ type: 'info', title: 'Has abandonado el equipo', message: `Ya no eres parte de ${team.name}.` });
        } catch (error) {
            console.error("Error al abandonar el equipo:", String(error));
            showToast({ type: 'error', title: 'Error', message: 'No se pudo abandonar el equipo.' });
        }
    };

    const handleRewardAnimationEnd = useCallback(() => {
        if (rewardInfo) {
            setRatingInfo({ field: rewardInfo.field });
        }
        setRewardInfo(null);
    }, [rewardInfo]);

    const handleRatingSubmit = async (fieldId: string, rating: number, comment: string) => {
        if (!user) return;
        const newReview: Review = { id: `r${Date.now()}`, author: user.name, rating, comment, timestamp: new Date() };
        await db.addReviewToField(fieldId, newReview);
        
        setFields(prevFields => {
            return prevFields.map(field => {
                if (field.id === fieldId) {
                    const newTotalReviews = field.reviews.length + 1;
                    const newAverageRating = ((field.rating * field.reviews.length) + rating) / newTotalReviews;
                    return { ...field, reviews: [newReview, ...field.reviews], rating: parseFloat(newAverageRating.toFixed(1)) };
                }
                return field;
            });
        });

        setRatingInfo(null);
        showToast({ type: 'success', title: '¡Gracias por tu opinión!', message: 'Tu calificación nos ayuda a mejorar.' });
    };

    const handleSendInvitation = async (team: Team, playerToRecruit: Player) => {
        if (!user) return;
        const invitationData: Omit<Invitation, 'id'> = {
            teamId: team.id,
            teamName: team.name,
            teamLogo: team.logo,
            fromUserId: user.id,
            fromUserName: user.name,
            toUserId: playerToRecruit.id,
            toUserName: playerToRecruit.name,
            timestamp: new Date(),
        };
        await db.addInvitation(invitationData);
        showToast({ type: 'success', title: 'Invitación Enviada', message: `Se ha invitado a ${playerToRecruit.name} a unirse a ${team.name}.` });
    };

    const handleCancelInvitation = async (invitationId: string) => {
        await db.deleteInvitation(invitationId);
        showToast({ type: 'info', title: 'Invitación Cancelada', message: 'La invitación ha sido retirada.' });
    };

    const handleAcceptInvitation = async (invitation: Invitation) => {
        if (!user || !user.playerProfile) return;
        const team = allTeams.find(t => t.id === invitation.teamId);
        if (!team) {
            showToast({ type: 'error', title: 'Error', message: 'El equipo ya no existe.' });
            await db.deleteInvitation(invitation.id);
            return;
        }

        // Add player to team
        const updatedPlayers = [...team.players, user.playerProfile];
        await handleUpdateTeam(team.id, { players: updatedPlayers });

        // Add team to player's profile
        const updatedTeamIds = [...(user.teamIds || []), team.id];
        await handleUpdateUserTeams(updatedTeamIds);

        // Notify the captain
        const captain = allUsers.find(u => u.id === invitation.fromUserId);
        if (captain) {
            const notificationForCaptain: Omit<Notification, 'id' | 'timestamp'> = {
                type: 'success',
                title: '¡Nuevo Miembro!',
                message: `${invitation.toUserName} se ha unido a ${invitation.teamName}.`,
                read: false
            };
            
            const newNotification = { ...notificationForCaptain, id: Date.now(), timestamp: new Date() };
            const updatedNotifications = [newNotification, ...(captain.notifications || [])].slice(0, 50);
            
            await db.updateUser(captain.id, { notifications: updatedNotifications });
            // Update local state for consistency
            setAllUsers(prevUsers => prevUsers.map(u => 
                u.id === captain.id ? { ...u, notifications: updatedNotifications } : u
            ));
        }

        // Enviar mensaje al chat del equipo
        const systemMessageData: Omit<SystemMessage, "id" | "timestamp"> = {
            type: 'system',
            text: `${invitation.toUserName} se ha unido al equipo. ¡Bienvenido!`,
        };
        await db.addChatMessage(invitation.teamId, systemMessageData);

        // Delete the invitation
        await db.deleteInvitation(invitation.id);
        
        // Show toast to the current user
        showToast({ type: 'success', title: '¡Te has unido!', message: `Ahora eres miembro de ${team.name}.` });
    };

    const handleRejectInvitation = async (invitation: Invitation) => {
        // Notify the captain
        const captain = allUsers.find(u => u.id === invitation.fromUserId);
        if (captain) {
            const notificationForCaptain: Omit<Notification, 'id' | 'timestamp'> = {
                type: 'info',
                title: 'Invitación Rechazada',
                message: `${invitation.toUserName} ha rechazado unirse a ${invitation.teamName}.`,
                read: false
            };

            const newNotification = { ...notificationForCaptain, id: Date.now(), timestamp: new Date() };
            const updatedNotifications = [newNotification, ...(captain.notifications || [])].slice(0, 50);

            await db.updateUser(captain.id, { notifications: updatedNotifications });
            // Update local state for consistency
            setAllUsers(prevUsers => prevUsers.map(u =>
                u.id === captain.id ? { ...u, notifications: updatedNotifications } : u
            ));
        }
        
        // Delete the invitation
        await db.deleteInvitation(invitation.id);

        // Show toast to the current user
        showToast({ type: 'info', title: 'Invitación Rechazada', message: `Has rechazado la invitación de ${invitation.teamName}.` });
    };

    const sendNotificationToUser = async (targetUserId: string, notifData: Omit<Notification, 'id' | 'timestamp'>) => {
        const targetUser = allUsers.find(u => u.id === targetUserId);
        if (!targetUser) return;

        const newNotification = { ...notifData, id: Date.now(), timestamp: new Date(), read: false };
        const updatedNotifications = [newNotification, ...(targetUser.notifications || [])].slice(0, 50);

        try {
            await db.updateUser(targetUserId, { notifications: updatedNotifications });
            if (!isFirebaseConfigured) {
                setAllUsers(prevUsers => prevUsers.map(u => 
                    u.id === targetUserId ? { ...u, notifications: updatedNotifications } : u
                ));
            }
        } catch (error) {
            console.error(`Error sending notification to user ${targetUserId}:`, String(error));
        }
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
        
        try {
            await db.updateUser(user.id, { acceptedMatchInvites: updatedAcceptedMatches });
            const updatedUser = { ...user, acceptedMatchInvites: updatedAcceptedMatches };
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
            message: `Confirmaste tu asistencia al partido.`,
        });
    };

    const handleRejectMatchInvite = async (notification: Notification) => {
        if (!user || !notification.payload) return;

        const updatedNotifications = notifications.filter(n => n.id !== notification.id);
        setNotifications(updatedNotifications);
        try {
            await db.updateUser(user.id, { notifications: updatedNotifications });
        } catch (error) {
            console.error("Error removing match invite notification:", String(error));
        }

        const notificationForInviter: Omit<Notification, 'id' | 'timestamp'> = {
            type: 'info',
            title: 'Invitación Rechazada',
            message: `${user.name} ha rechazado tu invitación al partido en ${notification.payload.fieldName}.`,
            read: false,
        };
        await sendNotificationToUser(notification.payload.fromUserId, notificationForInviter);

        showToast({
            type: 'info',
            title: 'Invitación Rechazada',
            message: `Has rechazado la invitación al partido.`,
        });
    };
    
    const handleCancelMatchAttendance = async (acceptedInviteId: string) => {
        if (!user || !user.acceptedMatchInvites) return;

        const inviteToCancel = user.acceptedMatchInvites.find(inv => inv.id === acceptedInviteId);
        if (!inviteToCancel) return;

        const updatedAcceptedMatches = user.acceptedMatchInvites.filter(inv => inv.id !== acceptedInviteId);

        try {
            await db.updateUser(user.id, { acceptedMatchInvites: updatedAcceptedMatches });
            const updatedUser = { ...user, acceptedMatchInvites: updatedAcceptedMatches };
            setUser(updatedUser);
            setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
            
            // Notify inviter
            const notificationForInviter: Omit<Notification, 'id' | 'timestamp'> = {
                type: 'error',
                title: 'Asistencia Cancelada',
                message: `${user.name} ha cancelado su asistencia al partido en ${inviteToCancel.fieldName}.`,
                read: false,
            };
            await sendNotificationToUser(inviteToCancel.inviterId, notificationForInviter);

            showToast({ type: 'info', title: 'Asistencia Cancelada', message: 'Has cancelado tu asistencia al partido.' });

        } catch (error) {
            console.error("Error cancelling match attendance:", String(error));
             showToast({ type: 'error', title: 'Error', message: 'No se pudo cancelar la asistencia.' });
        }
    };
    
    const handleSetAvailability = async (isAvailable: boolean, note?: string) => {
        if (!user || !user.playerProfile) return;
    
        let locationUpdate: { latitude: number; longitude: number; timestamp: Date } | null = null;
        if (isAvailable) {
            try {
                const position = await getCurrentPosition({ timeout: 10000 });
                locationUpdate = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    timestamp: new Date(),
                };
            } catch (error) {
                console.error("No se pudo obtener la ubicación:", String(error));
                showToast({
                    type: 'error',
                    title: 'Error de Ubicación',
                    message: 'No se pudo obtener tu ubicación. Activa los permisos e inténtalo de nuevo.'
                });
                return Promise.reject(error);
            }
        }
    
        const updatedPlayerProfile = {
            ...user.playerProfile,
            isAvailableToday: isAvailable,
            lastKnownLocation: isAvailable ? locationUpdate : null,
            availabilityNote: note || '',
        };
    
        try {
            await db.updateUser(user.id, { playerProfile: updatedPlayerProfile });
    
            const updatedUser = { ...user, playerProfile: updatedPlayerProfile };
            setUser(updatedUser);
            setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    
            showToast({
                type: 'success',
                title: 'Disponibilidad Actualizada',
                message: isAvailable ? 'Ahora eres visible para otros jugadores.' : 'Ya no estás visible como disponible.'
            });
            return Promise.resolve();
        } catch (error) {
            console.error("Error al actualizar disponibilidad:", String(error));
            showToast({
                type: 'error',
                title: 'Error',
                message: 'No se pudo actualizar tu disponibilidad.'
            });
            return Promise.reject(error);
        }
    };


    const renderView = () => {
        const homeComponent = <Home 
            onSearch={handleSearch} 
            onSelectField={handleSelectField} 
            fields={fields} 
            loading={loading && allBookings.length === 0} 
            favoriteFields={user?.favoriteFields || []} 
            onToggleFavorite={handleToggleFavorite} 
            theme={theme} 
            announcements={announcements} 
            user={user} 
            onSearchByLocation={handleSearchByLocation} 
            isSearchingLocation={isSearchingLocation} 
            weatherData={weatherData} 
            isWeatherLoading={isWeatherLoading} 
            onRefreshWeather={fetchWeather}
            onSearchResults={(results) => {
                setSearchResults(results);
                handleNavigate(View.SEARCH_RESULTS);
            }} 
            allBookings={allBookings}
            allTeams={allTeams}
            currentTime={currentTime}
            acceptedMatches={user?.acceptedMatchInvites || []}
            onCancelMatchAttendance={handleCancelMatchAttendance}
        />;
        
        const viewElement = (() => {
            switch (view) {
                case View.SEARCH_RESULTS:
                    return <SearchResults fields={searchResults} onSelectField={handleSelectField} onBack={() => handleNavigate(View.HOME, { isBack: true })} favoriteFields={user?.favoriteFields || []} onToggleFavorite={handleToggleFavorite} theme={theme} loading={isSearchingLocation} />;
                case View.FIELD_DETAIL:
                    if (selectedField) {
                        const complexFields = fields.filter(f => f.complexId === selectedField.complexId);
                        const complexObject = {
                            name: selectedField.name.split(' - ')[0],
                            address: selectedField.address,
                            city: selectedField.city,
                            description: selectedField.description,
                            images: selectedField.images,
                            services: selectedField.services,
                            fields: complexFields.length > 0 ? complexFields : [selectedField] // Fallback for fields without complexId
                        };
                        return <FieldDetail 
                                    complex={complexObject} 
                                    initialFieldId={selectedField.id}
                                    onBookNow={handleBookNow} 
                                    onBack={() => handleNavigate(View.HOME, { isBack: true })} 
                                    favoriteFields={user?.favoriteFields || []} 
                                    // FIX: Corrected a typo where 'onToggleFavorite' was passed instead of the handler 'handleToggleFavorite'.
                                    onToggleFavorite={handleToggleFavorite}
                                    allBookings={allBookings}
                                    weatherData={weatherData}
                                />;
                    }
                    return homeComponent;
                case View.BOOKING:
                    if (bookingDetails && user) {
                        return <Booking user={user} allTeams={allTeams} details={bookingDetails} onConfirm={handleConfirmBooking} onBack={() => handleNavigate(View.FIELD_DETAIL, { isBack: true })} isBookingLoading={isBookingLoading} />;
                    }
                    return homeComponent;
                case View.BOOKING_CONFIRMATION:
                    if(confirmedBooking) {
                        return <BookingConfirmation details={confirmedBooking} onDone={() => handleNavigate(View.HOME)} weatherData={weatherData} />;
                    }
                    return homeComponent;
                case View.LOGIN:
                    return <Login onLogin={handleLogin} onNavigateToHome={() => handleNavigate(View.HOME)} onNavigate={handleNavigate} />;
                case View.REGISTER:
                    return <Register onRegister={handleRegister} onNavigate={handleNavigate} isRegisterLoading={isRegisterLoading} />;
                case View.OWNER_REGISTER:
                    return <OwnerRegisterView onRegister={handleOwnerRegister} onNavigate={handleNavigate} isOwnerRegisterLoading={isOwnerRegisterLoading} />;
                case View.OWNER_PENDING_VERIFICATION:
                    return <OwnerPendingVerificationView onNavigate={handleNavigate} />;
                case View.FORGOT_PASSWORD:
                    return <ForgotPasswordView onNavigate={handleNavigate} addNotification={showToast} />;
                case View.OWNER_DASHBOARD:
                    if (user) {
                        return <OwnerDashboard 
                                    user={user}
                                    fields={ownerFields} 
                                    setFields={setFields} 
                                    bookings={ownerBookings}
                                    setBookings={setAllBookings}
                                    announcements={announcements}
                                    setAnnouncements={setAnnouncements}
                                    addNotification={showToast}
                                    onLogout={handleLogout}
                                    allUsers={allUsers}
                                    allFields={fields}
                                />;
                    }
                    return <Login onLogin={handleLogin} onNavigateToHome={() => handleNavigate(View.HOME)} onNavigate={handleNavigate} />;
                case View.SUPER_ADMIN_DASHBOARD:
                    return <SuperAdminDashboard
                                currentUser={user}
                                allUsers={allUsers}
                                setAllUsers={setAllUsers}
                                fields={fields}
                                setFields={setFields}
                                ownerApplications={ownerApplications}
                                setOwnerApplications={setOwnerApplications}
                                addNotification={showToast}
                                onLogout={handleLogout}
                            />;
                case View.PROFILE:
                    if (user) {
                        return <ProfileView 
                                    user={user} 
                                    allTeams={allTeams}
                                    setSocialSection={setSocialSection}
                                    onLogout={handleLogout} 
                                    allFields={fields} 
                                    onToggleFavorite={handleToggleFavorite} 
                                    onSelectField={handleSelectField}
                                    onUpdateProfilePicture={handleUpdateProfilePicture}
                                    onRemoveProfilePicture={handleRemoveProfilePicture}
                                    onUpdateUser={handleUpdateUserInfo}
                                    onChangePassword={handleChangePassword}
                                    onUpdateNotificationPreferences={handleUpdateNotificationPreferences}
                                    onNavigate={handleNavigate}
                                    setIsPremiumModalOpen={setIsPremiumModalOpen}
                                />;
                    }
                     return <Login onLogin={handleLogin} onNavigateToHome={() => handleNavigate(View.HOME)} onNavigate={handleNavigate} />;
                case View.APPEARANCE:
                     if (user) {
                        return <AppearanceSettings 
                            currentTheme={theme}
                            onUpdateTheme={handleUpdateTheme}
                            onBack={() => handleNavigate(View.PROFILE, { isBack: true })}
                            currentAccentColor={accentColor}
                            onUpdateAccentColor={handleUpdateAccentColor}
                        />
                     }
                     return <Login onLogin={handleLogin} onNavigateToHome={() => handleNavigate(View.HOME)} onNavigate={handleNavigate} />;
                case View.HELP_SUPPORT:
                     if (user) {
                        return <HelpView onNavigate={handleNavigate} />
                     }
                     return <Login onLogin={handleLogin} onNavigateToHome={() => handleNavigate(View.HOME)} onNavigate={handleNavigate} />;
                case View.PAYMENT_METHODS:
                     if(user){
                        return <PaymentMethodsView 
                                user={user}
                                onBack={() => handleNavigate(View.PROFILE, { isBack: true })}
                                onAddPaymentMethod={handleAddPaymentMethod}
                                onDeletePaymentMethod={handleDeletePaymentMethod}
                                onSetDefaultPaymentMethod={handleSetDefaultPaymentMethod}
                                />;
                     }
                     return <Login onLogin={handleLogin} onNavigateToHome={() => handleNavigate(View.HOME)} onNavigate={handleNavigate} />;
                case View.BOOKINGS:
                    if(user){
                        return <BookingsView bookings={bookings} onSelectBooking={handleSelectBooking} />;
                    }
                    return <Login onLogin={handleLogin} onNavigateToHome={() => handleNavigate(View.HOME)} onNavigate={handleNavigate} />;
                case View.BOOKING_DETAIL:
                    if(user && selectedBooking){
                        return <BookingDetailView 
                                    booking={selectedBooking} 
                                    user={user}
                                    allTeams={allTeams}
                                    onBack={() => handleNavigate(View.BOOKINGS, { isBack: true })} 
                                    onCancelBooking={handleCancelBooking} 
                                    weatherData={weatherData}
                                    onUpdateScore={handleUpdateScore}
                                    onFinalizeMatch={handleFinalizeMatch}
                                    currentTime={currentTime}
                                />;
                    }
                     return <Login onLogin={handleLogin} onNavigateToHome={() => handleNavigate(View.HOME)} onNavigate={handleNavigate} />;
                case View.SOCIAL:
                    if (user) {
                        return <SocialView 
                                    user={user}
                                    allTeams={allTeams}
                                    allUsers={allUsers}
                                    allBookings={allBookings}
                                    addNotification={showToast} 
                                    onNavigate={handleNavigate} 
                                    setIsPremiumModalOpen={setIsPremiumModalOpen} 
                                    section={socialSection}
                                    setSection={setSocialSection}
                                    onUpdateUserTeams={handleUpdateUserTeams}
                                    onUpdateTeam={handleUpdateTeam}
                                    sentInvitations={sentInvitations}
                                    onSendInvitation={handleSendInvitation}
                                    onCancelInvitation={handleCancelInvitation}
                                    onRemovePlayerFromTeam={handleRemovePlayerFromTeam}
                                    onLeaveTeam={handleLeaveTeam}
                                    weatherData={weatherData}
                                    onSetAvailability={handleSetAvailability}
                                />;
                    }
                    return <Login onLogin={handleLogin} onNavigateToHome={() => handleNavigate(View.HOME)} onNavigate={handleNavigate} />;
                 case View.PLAYER_PROFILE_CREATOR:
                    if (user) {
                        return <PlayerProfileCreatorView 
                                    onBack={() => handleNavigate(View.SOCIAL, { isBack: true })} 
                                    user={user}
                                    onSave={handleUpdatePlayerProfile}
                                />;
                    }
                    return <Login onLogin={handleLogin} onNavigateToHome={() => handleNavigate(View.HOME)} onNavigate={handleNavigate} />;
                case View.HOME:
                default:
                    return homeComponent;
            }
        })();
        
        return (
            <div key={viewKey} className={animationClass}>
                {viewElement}
            </div>
        );
    };
    
    // FIX: Removed duplicated function and constant declarations.
    const isFullscreenView = [View.LOGIN, View.REGISTER, View.FORGOT_PASSWORD, View.OWNER_REGISTER, View.OWNER_PENDING_VERIFICATION].includes(view);
    
    const isSocialView = view === View.SOCIAL;
    const socialSectionsWithDarkBg = ['hub', 'my-team', 'available-today'];
    const showDarkSocialBg = isSocialView && socialSectionsWithDarkBg.includes(socialSection);
    const isChatView = isSocialView && socialSection === 'chat';
    
    const showHeader = !isChatView && ![View.LOGIN, View.REGISTER, View.FORGOT_PASSWORD, View.PLAYER_PROFILE_CREATOR, View.OWNER_DASHBOARD, View.SUPER_ADMIN_DASHBOARD, View.OWNER_REGISTER, View.OWNER_PENDING_VERIFICATION, View.SOCIAL].includes(view);
    const showBottomNav = !isChatView && user && !user.isOwner && !user.isAdmin && ![View.LOGIN, View.REGISTER, View.FORGOT_PASSWORD, View.BOOKING, View.BOOKING_CONFIRMATION, View.OWNER_DASHBOARD, View.PLAYER_PROFILE_CREATOR, View.SOCIAL].includes(view);
    
    return (
        <div className={`bg-slate-50 min-h-screen dark:bg-gray-900 transition-colors duration-300 ${showDarkSocialBg ? 'daviplay-hub-bg' : ''} ${isChatView ? 'team-chat-bg' : ''}`}>
            {showDarkSocialBg && <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80 z-0"></div>}
            
            <div className="relative z-10">
                <FirebaseWarningBanner />
                <OfflineBanner isOnline={isOnline} />
                {showHeader && <Header 
                                user={user} 
                                onNavigate={handleNavigate} 
                                onLogout={handleLogout} 
                                notifications={notifications} 
                                invitations={receivedInvitations}
                                onDismiss={dismissNotification} 
                                onMarkAllAsRead={handleMarkAllNotificationsAsRead} 
                                onClearAll={handleClearNotifications} 
                                onAcceptInvitation={handleAcceptInvitation}
                                onRejectInvitation={handleRejectInvitation}
                                onAcceptMatchInvite={handleAcceptMatchInvite}
                                onRejectMatchInvite={handleRejectMatchInvite}
                                currentTime={currentTime}/>}
                <main className={`transition-all duration-300 ${!isChatView && 'overflow-x-hidden'} ${!showHeader ? '' : `container mx-auto px-4 py-6 sm:py-8 ${showBottomNav ? 'pb-28' : ''}`} ${view === View.PLAYER_PROFILE_CREATOR ? 'p-0 sm:p-0 max-w-full' : ''} ${isFullscreenView ? 'p-0 sm:p-0 max-w-full' : ''} ${isSocialView ? 'container mx-auto p-0 sm:p-0 max-w-full' : ''}`}>
                    {renderView()}
                </main>
                {showBottomNav && <BottomNav activeTab={activeTab} onNavigate={handleTabNavigate} />}
                <NotificationContainer notifications={toasts} onDismiss={dismissToast} />
                {isPremiumModalOpen && <PremiumLockModal onClose={() => setIsPremiumModalOpen(false)} />}
                {rewardInfo && (
                    <RewardAnimation 
                        field={rewardInfo.field}
                        onAnimationEnd={() => handleRewardAnimationEnd()}
                    />
                )}
                {ratingInfo && (
                    <RatingModal 
                        field={ratingInfo.field}
                        onClose={() => setRatingInfo(null)}
                        onSubmit={handleRatingSubmit}
                    />
                )}
            </div>
        </div>
    );
};

export default App;
