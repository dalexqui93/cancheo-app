

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { SoccerField, User, Notification, BookingDetails, ConfirmedBooking, Tab, Theme, AccentColor, PaymentMethod, CardPaymentMethod, Player, Announcement, Loyalty, UserLoyalty, Review, OwnerApplication, WeatherData, SocialSection } from './types';
import { View } from './types';
import Header from './components/Header';
import Home from './views/Home';
import SearchResults from './views/SearchResults';
import FieldDetail from './views/FieldDetail';
import Booking from './views/Booking';
import BookingConfirmation from './views/BookingConfirmation';
import Login from './views/Login';
import Register from './views/Register';
import OwnerDashboard from './views/AdminDashboard';
import ProfileView from './views/ProfileView';
import BookingsView from './views/BookingsView';
import BookingDetailView from './views/BookingDetailView';
import NotificationContainer from './components/NotificationContainer';
import BottomNav from './components/BottomNav';
import AppearanceSettings from './views/AppearanceSettings';
import HelpView from './views/HelpView';
import SocialView from './views/SocialView';
import PaymentMethodsView from './views/PaymentMethodsView';
import PlayerProfileCreatorView from './views/player_profile/PlayerProfileCreatorView';
import PremiumLockModal from './components/PremiumLockModal';
import ForgotPasswordView from './views/ForgotPassword';
import RewardAnimation from './components/RewardAnimation';
import RatingModal from './components/RatingModal';
import OwnerRegisterView from './views/OwnerRegisterView';
import OwnerPendingVerificationView from './views/OwnerPendingVerificationView';
import SuperAdminDashboard from './views/SuperAdminDashboard';
import * as db from './firebase';
import { isFirebaseConfigured } from './firebase';
import { getCurrentPosition, calculateDistance } from './utils/geolocation';

const FirebaseWarningBanner: React.FC = () => {
    if (isFirebaseConfigured) {
        return null;
    }

    return (
        <div className="bg-yellow-400 text-yellow-900 text-center p-2 font-semibold text-sm sticky top-0 z-[101]">
            <div className="container mx-auto">
                Atención: Firebase no está configurado. La aplicación se ejecuta en modo de demostración. Edita <strong>firebase.ts</strong>.
            </div>
        </div>
    );
};

// Sonido de notificación en formato Base64 para ser auto-contenido
const notificationSound = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAB3amZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZm';

const App = () => {
    const [fields, setFields] = useState<SoccerField[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [ownerApplications, setOwnerApplications] = useState<OwnerApplication[]>([]);
    const [allBookings, setAllBookings] = useState<ConfirmedBooking[]>([]);
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

    // Weather State
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);
    const [weatherError, setWeatherError] = useState<string | null>(null);


    // Solicitar permiso para notificaciones al cargar la app
    useEffect(() => {
        if ('Notification' in window) {
            // FIX: Use window.Notification to avoid name clash with imported Notification type
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
    
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            if (isFirebaseConfigured) {
                await db.seedDatabase();
            }

            const [fieldsData, usersData, applicationsData, bookingsData, announcementsData] = await Promise.all([
                db.getFields(),
                db.getUsers(),
                db.getOwnerApplications(),
                db.getAllBookings(),
                db.getAnnouncements(),
            ]);

            setFields(fieldsData);
            setAllUsers(usersData);
            setOwnerApplications(applicationsData);
            setAllBookings(bookingsData);
            setAnnouncements(announcementsData);
            setLoading(false);
        };
        loadData();
    }, []);

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
                // FIX: Cast unknown error to string for console.warn
                console.warn('No se pudo obtener el nombre de la ubicación para el clima: ' + String(geoError));
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
            // FIX: Cast unknown error to string for console.warn
            console.warn('Error al obtener el clima, usando fallback/cache: ' + String(error));
            const cachedData = localStorage.getItem('weatherCache');
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                // Asegúrate de que las cadenas de fecha se conviertan de nuevo en objetos Date
                parsedData.lastUpdated = new Date(parsedData.lastUpdated);
                parsedData.current.time = new Date(parsedData.current.time);
                parsedData.hourly = parsedData.hourly.map((h: any) => ({...h, time: new Date(h.time)}));
                setWeatherData(parsedData);
            } else {
                setWeatherError("No se pudo cargar el pronóstico del tiempo.");
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
            // FIX: Cast unknown error to string for console.error
            console.error('Error al reproducir sonido de notificación: ' + String(error));
        }
    }, []);

    const addPersistentNotification = useCallback(async (notif: Omit<Notification, 'id' | 'timestamp'>) => {
        // Mostrar notificación nativa si la app está en segundo plano
        // FIX: Use window.Notification to avoid name clash with imported Notification type
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
                // FIX: Cast unknown error to string for console.error
                console.error('Error saving notification to database: ' + String(error));
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
                // FIX: Cast unknown error to string for console.error
                console.error('Error deleting notification from database: ' + String(error));
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
                // FIX: Cast unknown error to string for console.error
                console.error('Error marking notifications as read: ' + String(error));
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
                // FIX: Cast unknown error to string for console.error
                console.error('Error clearing notifications: ' + String(error));
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
    

    // Loyalty Program Check
    useEffect(() => {
        if (!user || loading) return;
    
        const checkLoyalty = async () => {
            const now = new Date();
            const playedBookings = bookings.filter(b => 
                b.userId === user.id &&
                b.status === 'confirmed' && 
                !b.loyaltyApplied && 
                new Date(b.date) < now
            );
    
            if (playedBookings.length > 0) {
                const newLoyalty: UserLoyalty = {};
                if (user.loyalty) {
                    for (const key in user.loyalty) {
                        if (Object.prototype.hasOwnProperty.call(user.loyalty, key)) {
                            const value = user.loyalty[key];
                            newLoyalty[key] = { progress: value.progress, freeTickets: value.freeTickets };
                        }
                    }
                }
                let loyaltyWasUpdated = false;
    
                for (const booking of playedBookings) {
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
    
                const playedBookingIds = new Set(playedBookings.map(b => b.id));
                for (const bookingId of playedBookingIds) {
                    await db.updateBooking(bookingId, { loyaltyApplied: true });
                }
                setAllBookings(prevBookings => 
                    prevBookings.map(b => 
                        playedBookingIds.has(b.id) ? { ...b, loyaltyApplied: true } : b
                    )
                );
            }
        };
    
        checkLoyalty();
    }, [bookings, user, loading, addPersistentNotification]);

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
                // Fix: Cast 'error' to string to allow concatenation in console.error.
                console.error('Registration error: ' + String(error));
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
                // FIX: Cast unknown error to string for console.error
                console.error('Owner registration error: ' + String(error));
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
            // FIX: Cast unknown error to string for console.error
            console.error('Error getting location: ' + String(error));
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
            setAllBookings(prev => [newBooking, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            handleNavigate(View.BOOKING_CONFIRMATION);
            addPersistentNotification({type: 'success', title: '¡Reserva confirmada!', message: `Tu reserva en ${booking.field.name} está lista.`});
        } catch (error) {
            // FIX: Cast unknown error to string for console.error
            console.error('Booking confirmation error: ' + String(error));
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
            setAllBookings(prev => prev.map(b => 
                b.id === bookingId ? { ...b, status: 'cancelled' } : b
            ));
            
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
            // FIX: Cast unknown error to string for console.error
            console.error('Error updating password: ' + String(error));
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

    const handleRewardAnimationEnd = (field: SoccerField) => {
        setRewardInfo(null);
        setRatingInfo({ field });
    };

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

    const ownerFields = useMemo(() => {
        if (user?.isOwner) {
            return fields.filter(f => f.ownerId === user.id);
        }
        return [];
    }, [user, fields]);
    const ownerFieldIds = useMemo(() => new Set(ownerFields.map(f => f.id)), [ownerFields]);

    const ownerBookings = useMemo(() => {
        if (user?.isOwner) {
            return allBookings.filter(b => ownerFieldIds.has(b.field.id));
        }
        return [];
    }, [user, allBookings, ownerFieldIds]);
    
    const isFullscreenView = [View.LOGIN, View.REGISTER, View.FORGOT_PASSWORD, View.OWNER_REGISTER, View.OWNER_PENDING_VERIFICATION].includes(view);

    const renderView = () => {
        const homeComponent = <Home 
            onSearch={handleSearch} 
            onSelectField={handleSelectField} 
            fields={fields} 
            loading={loading} 
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
                                    onToggleFavorite={handleToggleFavorite}
                                    allBookings={allBookings}
                                    weatherData={weatherData}
                                />;
                    }
                    return homeComponent;
                case View.BOOKING:
                    if (bookingDetails && user) {
                        return <Booking user={user} details={bookingDetails} onConfirm={handleConfirmBooking} onBack={() => handleNavigate(View.FIELD_DETAIL, { isBack: true })} isBookingLoading={isBookingLoading} />;
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
                        return <BookingDetailView booking={selectedBooking} onBack={() => handleNavigate(View.BOOKINGS, { isBack: true })} onCancelBooking={handleCancelBooking} weatherData={weatherData} />;
                    }
                     return <Login onLogin={handleLogin} onNavigateToHome={() => handleNavigate(View.HOME)} onNavigate={handleNavigate} />;
                case View.SOCIAL:
                    if (user) {
                        return <SocialView 
                                    user={user} 
                                    addNotification={showToast} 
                                    onNavigate={handleNavigate} 
                                    setIsPremiumModalOpen={setIsPremiumModalOpen} 
                                    section={socialSection}
                                    setSection={setSocialSection}
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
    
    const isSocialView = view === View.SOCIAL;
    const socialSectionsWithDarkBg = ['hub', 'my-team'];
    const showDarkSocialBg = isSocialView && socialSectionsWithDarkBg.includes(socialSection);
    
    const showHeader = ![View.LOGIN, View.REGISTER, View.FORGOT_PASSWORD, View.PLAYER_PROFILE_CREATOR, View.OWNER_DASHBOARD, View.SUPER_ADMIN_DASHBOARD, View.OWNER_REGISTER, View.OWNER_PENDING_VERIFICATION, View.SOCIAL].includes(view);
    const showBottomNav = user && !user.isOwner && !user.isAdmin && ![View.LOGIN, View.REGISTER, View.FORGOT_PASSWORD, View.BOOKING, View.BOOKING_CONFIRMATION, View.OWNER_DASHBOARD, View.PLAYER_PROFILE_CREATOR].includes(view);

    return (
        <div className={`bg-slate-50 min-h-screen dark:bg-gray-900 transition-colors duration-300 ${showDarkSocialBg ? 'daviplay-hub-bg' : ''}`}>
            {showDarkSocialBg && <div className="absolute inset-0"></div>}
            <div className="relative z-10">
                <FirebaseWarningBanner />
                {showHeader && <Header user={user} onNavigate={handleNavigate} onLogout={handleLogout} notifications={notifications} onDismiss={dismissNotification} onMarkAllAsRead={handleMarkAllNotificationsAsRead} onClearAll={handleClearNotifications}/>}
                <main className={`transition-all duration-300 overflow-x-hidden ${!showHeader ? '' : `container mx-auto px-4 py-6 sm:py-8 ${showBottomNav ? 'pb-28' : ''}`} ${view === View.PLAYER_PROFILE_CREATOR ? 'p-0 sm:p-0 max-w-full' : ''} ${isFullscreenView ? 'p-0 sm:p-0 max-w-full' : ''} ${isSocialView ? 'container mx-auto p-0 sm:p-0 max-w-full' : ''}`}>
                    {renderView()}
                </main>
                {showBottomNav && <BottomNav activeTab={activeTab} onNavigate={handleTabNavigate} />}
                <NotificationContainer notifications={toasts} onDismiss={dismissToast} />
                {isPremiumModalOpen && <PremiumLockModal onClose={() => setIsPremiumModalOpen(false)} />}
                {rewardInfo && (
                    <RewardAnimation 
                        field={rewardInfo.field}
                        onAnimationEnd={() => handleRewardAnimationEnd(rewardInfo.field)}
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