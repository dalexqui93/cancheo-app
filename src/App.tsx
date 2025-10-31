// Fix: Implemented the main App component to manage state and routing.
// Fix: Corrected the React import to include useState, useEffect, and useCallback hooks.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { SoccerField, User, Notification, BookingDetails, ConfirmedBooking, Tab, Theme, AccentColor, PaymentMethod, CardPaymentMethod, Player, Announcement, Loyalty, UserLoyalty, Review, OwnerApplication, WeatherData } from './types';
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


const App: React.FC = () => {
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
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
    const [accentColor, setAccentColor] = useState<AccentColor>(() => (localStorage.getItem('accentColor') as AccentColor) || 'green');
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [animationClass, setAnimationClass] = useState('animate-fade-in');
    const [viewKey, setViewKey] = useState(0);
    const [rewardInfo, setRewardInfo] = useState<{ field: SoccerField } | null>(null);
    const [ratingInfo, setRatingInfo] = useState<{ field: SoccerField } | null>(null);
    const [isBookingLoading, setIsBookingLoading] = useState(false);
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);
    const [isOwnerRegisterLoading, setIsOwnerRegisterLoading] = useState(false);
    const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);

    // Weather State
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);
    const [weatherError, setWeatherError] = useState<string | null>(null);

    
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

        const processWeatherData = (data: any): WeatherData => {
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
            const position = await getCurrentPosition({ timeout: 5000, maximumAge: 3600000 });
            const { latitude, longitude } = position.coords;
            const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weathercode&hourly=temperature_2m,apparent_temperature,precipitation_probability,weathercode,windspeed_10m&timezone=auto`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const processedData = processWeatherData(data);
            setWeatherData(processedData);
            localStorage.setItem('weatherCache', JSON.stringify(processedData));
        } catch (error) {
            console.warn(`Error fetching weather, using fallback/cache: ${String(error)}`);
            const cachedData = localStorage.getItem('weatherCache');
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                // Make sure date strings are converted back to Date objects
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


    // Fix: Corrected function to include timestamp when creating a notification to match the Notification type.
    const addNotification = useCallback((notif: Omit<Notification, 'id' | 'timestamp'>) => {
        const newNotification: Notification = {
            ...notif,
            id: Date.now(),
            timestamp: new Date()
        };
        setNotifications(prev => [newNotification, ...prev]);
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
                addNotification({
                    type: 'info',
                    title: 'Anuncio Importante',
                    message: `${field.name.split(' - ')[0]} anuncia un torneo de verano. ¡Inscripciones abiertas!`
                });
            } else if (notificationType < 0.66 && user.notificationPreferences?.specialDiscounts) {
                addNotification({
                    type: 'info',
                    title: '¡Oferta Especial!',
                    message: `¡${field.name.split(' - ')[0]} tiene un 15% de descuento en reservas nocturnas esta semana!`
                });
            } else if (user.notificationPreferences?.newAvailability) {
                addNotification({
                    type: 'info',
                    title: '¡Nueva Disponibilidad!',
                    message: `Se ha abierto un nuevo horario a las 20:00 en ${field.name.split(' - ')[0]} para mañana.`
                });
            }

        }, 20000); // Check every 20 seconds

        return () => clearInterval(notificationSimulator);
    }, [user, fields, addNotification]);

    const dismissNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
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
                    addNotification({ type: 'info', title: 'Recordatorio de Reserva', message: `Tu partido en ${booking.field.name} es mañana a las ${booking.time}.` });
                    updatedBooking.remindersSent.twentyFourHour = true;
                    reminderSent = true;
                }
    
                if (hoursUntil > 0 && hoursUntil <= 1 && !updatedBooking.remindersSent.oneHour) {
                    addNotification({ type: 'info', title: '¡Tu partido es pronto!', message: `Tu reserva en ${booking.field.name} es en aproximadamente una hora.` });
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
    }, [bookings, addNotification]);
    

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
                        addNotification({
                            type: 'success',
                            title: '¡Cancha Gratis!',
                            message: `¡Completaste ${loyaltyGoal} reservas en ${booking.field.name}! Acabas de ganar un ticket para una cancha gratis en este lugar.`
                        });
                    }
                }
                
                if (loyaltyWasUpdated) {
                    await db.updateUser(user.id, { loyalty: newLoyalty });
                    setUser(prevUser => prevUser ? { ...prevUser, loyalty: newLoyalty } : null);
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
    }, [bookings, user, loading, addNotification]);

    const handleLogin = (email: string, password: string) => {
        const loggedInUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
        if (loggedInUser) {
            setUser(loggedInUser);
            addNotification({
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
             addNotification({
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
            };
            const createdUser = await db.addUser(newUser);
            setUser(createdUser);
            setAllUsers(prev => [...prev, createdUser]);
            handleNavigate(View.HOME);
            addNotification({
                type: 'success',
                title: '¡Bienvenido!',
                message: `Tu cuenta ha sido creada exitosamente, ${createdUser.name}.`
            });
        } catch (error) {
            // FIX: Added type guard `instanceof Error` to safely access `error.message` and prevent potential runtime errors.
            if (error instanceof Error && error.message === 'DUPLICATE_EMAIL') {
                addNotification({
                    type: 'error',
                    title: 'Error de Registro',
                    message: 'Ya existe una cuenta con este correo electrónico.'
                });
            } else {
                addNotification({
                    type: 'error',
                    title: 'Error Inesperado',
                    message: 'No se pudo crear la cuenta. Inténtalo de nuevo.'
                });
                // FIX: Consolidated console.error arguments into a single string to fix type error.
                console.error(`Registration error: ${String(error)}`);
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

            addNotification({
                type: 'success',
                title: 'Solicitud Recibida',
                message: `Gracias ${newUser.name}, hemos recibido tu solicitud y la revisaremos pronto.`,
            });

            handleNavigate(View.OWNER_PENDING_VERIFICATION);
        } catch (error) {
            // FIX: Added type guard `instanceof Error` to safely access `error.message` and prevent potential runtime errors.
            if (error instanceof Error && error.message === 'DUPLICATE_EMAIL') {
                addNotification({
                    type: 'error',
                    title: 'Error de Registro',
                    message: 'Ya existe una cuenta con este correo electrónico.'
                });
            } else {
                 addNotification({
                    type: 'error',
                    title: 'Error Inesperado',
                    message: 'No se pudo crear la cuenta. Inténtalo de nuevo.'
                });
                // FIX: The console.error was receiving multiple arguments, which can cause issues. It has been consolidated into a single string.
                console.error(`Owner registration error: ${String(error)}`);
            }
        } finally {
            setIsOwnerRegisterLoading(false);
        }
    };

    const handleLogout = () => {
        setUser(null);
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
                    addNotification({ type: 'info', title: 'Inicia sesión', message: 'Debes iniciar sesión para acceder a DaviPlay.' });
                } else {
                    handleNavigate(View.SOCIAL, navOptions);
                }
                break;
            case 'bookings':
                if (!user) {
                    handleNavigate(View.LOGIN);
                    addNotification({ type: 'info', title: 'Inicia sesión', message: 'Debes iniciar sesión para ver tus reservas.' });
                } else {
                    handleNavigate(View.BOOKINGS, navOptions);
                }
                break;
            case 'profile':
                 if (!user) {
                    handleNavigate(View.LOGIN);
                    addNotification({ type: 'info', title: 'Inicia sesión', message: 'Debes iniciar sesión para ver tu perfil.' });
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
            addNotification({
                type: 'error',
                title: 'Geolocalización no soportada',
                message: 'Tu dispositivo no soporta esta función.'
            });
            return;
        }
    
        setIsSearchingLocation(true);
    
        try {
            const position = await getCurrentPosition();
            const { latitude, longitude } = position.coords;
    
            const fieldsWithDistance = fields.map(field => {
                const distance = calculateDistance(latitude, longitude, field.latitude, field.longitude);
                return { ...field, distance };
            });
            
            fieldsWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    
            setSearchResults(fieldsWithDistance);
            handleNavigate(View.SEARCH_RESULTS);
            
        } catch (error) {
            // FIX: Consolidated console.error arguments into a single string to fix type error.
            console.error(`Error getting location: ${String(error)}`);
            addNotification({
                type: 'error',
                title: 'Error de Ubicación',
                message: 'No se pudo obtener tu ubicación. Por favor, revisa los permisos.'
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
            addNotification({type: 'info', title: 'Inicia sesión para reservar', message: 'Debes tener una cuenta para poder reservar una cancha.'});
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
                    // FIX: Corrected typo from `updatedLoy` to `updatedLoyalty`.
                    await db.updateUser(user.id, { loyalty: updatedLoyalty });
                    setUser(prevUser => prevUser ? { ...prevUser, loyalty: updatedLoyalty } : null);
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
            addNotification({type: 'success', title: '¡Reserva confirmada!', message: `Tu reserva en ${booking.field.name} está lista.`});
        } catch (error) {
            // FIX: Consolidated console.error arguments into a single string to fix type error.
            console.error(`Booking confirmation error: ${String(error)}`);
            addNotification({
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
        
        try {
            await db.updateUser(user.id, { favoriteFields: newFavorites });
            setUser(prevUser => prevUser ? { ...prevUser, favoriteFields: newFavorites } : null);

            const complexField = fields.find(f => (f.complexId || f.id) === complexId);
            const complexName = complexField ? (complexField.name.split(' - ')[0] || complexField.name) : 'El complejo';

            if (isCurrentlyFavorite) {
                addNotification({type: 'info', title: 'Favorito eliminado', message: `${complexName} fue eliminado de tus favoritos.`});
            } else {
                addNotification({type: 'success', title: 'Favorito añadido', message: `${complexName} fue añadido a tus favoritos.`});
            }
        } catch (error) {
            // FIX: Consolidated console.error arguments into a single string to fix type error.
            console.error(`Error updating favorites: ${String(error)}`);
             addNotification({type: 'error', title: 'Error', message: 'No se pudo actualizar tus favoritos.'});
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
            addNotification({
                type: 'success',
                title: 'Reserva Cancelada',
                message: `Tu reserva en ${bookingToCancel.field.name} ha sido cancelada.`
            });
        }
    };

    const handleUpdateProfilePicture = async (imageDataUrl: string) => {
        if (!user) return;
        try {
            await db.updateUser(user.id, { profilePicture: imageDataUrl });
            setUser(prev => prev ? { ...prev, profilePicture: imageDataUrl } : null);
            addNotification({ type: 'success', title: 'Foto actualizada', message: 'Tu foto de perfil ha sido guardada.' });
        } catch (error) {
            // FIX: Consolidated console.error arguments into a single string to fix type error.
            console.error(`Error updating profile picture: ${String(error)}`);
        }
    };
    
    const handleRemoveProfilePicture = async () => {
        if (!user) return;
        try {
            await db.removeUserField(user.id, 'profilePicture');
            const { profilePicture, ...rest } = user;
            setUser(rest);
            addNotification({ type: 'info', title: 'Foto eliminada', message: 'Tu foto de perfil ha sido eliminada.' });
        } catch (error) {
            // FIX: Consolidated console.error arguments into a single string to fix type error.
            console.error(`Error removing profile picture: ${String(error)}`);
        }
    };
    
    const handleUpdateUserInfo = async (updatedInfo: { name: string; phone?: string }) => {
        if (!user) return;
        try {
            await db.updateUser(user.id, updatedInfo);
            setUser(prev => prev ? { ...prev, ...updatedInfo } : null);
            addNotification({ type: 'success', title: 'Perfil Actualizado', message: 'Tu información personal ha sido guardada.' });
        } catch (error) {
            // FIX: Consolidated console.error arguments into a single string to fix type error.
            console.error(`Error updating user info: ${String(error)}`);
        }
    };
    
    const handleChangePassword = async (currentPassword: string, newPassword: string) => {
        if (!user) return;
    
        if (user.password !== currentPassword) {
            addNotification({
                type: 'error',
                title: 'Error de Contraseña',
                message: 'La contraseña actual es incorrecta.'
            });
            return;
        }
    
        try {
            await db.updateUser(user.id, { password: newPassword });
            setUser(prev => prev ? { ...prev, password: newPassword } : null);
            addNotification({
                type: 'success',
                title: 'Contraseña Actualizada',
                message: 'Tu contraseña ha sido cambiada exitosamente.'
            });
        } catch (error) {
            // FIX: Consolidated console.error arguments into a single string to fix type error.
            console.error(`Error updating password: ${String(error)}`);
            addNotification({
                type: 'error',
                title: 'Error Inesperado',
                message: 'No se pudo actualizar tu contraseña. Inténtalo de nuevo.'
            });
        }
    };
    
    const handleUpdateNotificationPreferences = async (prefs: { newAvailability: boolean; specialDiscounts: boolean; importantNews: boolean; }) => {
        if (!user) return;
        try {
            await db.updateUser(user.id, { notificationPreferences: prefs });
            setUser(prev => prev ? { ...prev, notificationPreferences: prefs } : null);
            addNotification({ type: 'success', title: 'Preferencias actualizadas', message: 'Tus ajustes de notificación han sido guardados.' });
        } catch (error) {
            // FIX: Consolidated console.error arguments into a single string to fix type error.
            console.error(`Error updating notification preferences: ${String(error)}`);
        }
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
        setUser(prev => prev ? { ...prev, paymentMethods: updatedMethods } : null);
        addNotification({ type: 'success', title: 'Método de pago añadido', message: 'Tu nuevo método de pago ha sido guardado.' });
    };

    const handleDeletePaymentMethod = async (methodId: string) => {
        if (!user) return;
        const updatedMethods = user.paymentMethods?.filter(m => m.id !== methodId) || [];
        await db.updateUser(user.id, { paymentMethods: updatedMethods });
        setUser(prev => prev ? { ...prev, paymentMethods: updatedMethods } : null);
        addNotification({ type: 'info', title: 'Método de pago eliminado', message: 'El método de pago ha sido eliminado.' });
    };

    const handleSetDefaultPaymentMethod = async (methodId: string) => {
        if (!user || !user.paymentMethods) return;
        const updatedMethods: PaymentMethod[] = user.paymentMethods.map(m => ({ ...m, isDefault: m.id === methodId }));
        await db.updateUser(user.id, { paymentMethods: updatedMethods });
        setUser(prev => prev ? { ...prev, paymentMethods: updatedMethods } : null);
        addNotification({ type: 'success', title: 'Método predeterminado', message: 'Se ha actualizado tu método de pago principal.' });
    };

    const handleUpdatePlayerProfile = async (updatedProfile: Player) => {
        if (!user) return;
        await db.updateUser(user.id, { playerProfile: updatedProfile });
        setUser(prev => prev ? { ...prev, playerProfile: updatedProfile } : null);
        addNotification({ type: 'success', title: 'Perfil de Jugador Guardado', message: '¡Tus estadísticas han sido actualizadas!' });
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
        addNotification({ type: 'success', title: '¡Gracias por tu opinión!', message: 'Tu calificación nos ayuda a mejorar.' });
    };

    const ownerFields = useMemo(() => {
        if (user?.isOwner) {
            return fields.filter(f => f.ownerId === user.id);
        }
        return [];
    }, [user, fields]);

    const ownerBookings = useMemo(() => {
        if (user?.isOwner) {
            const ownerFieldIds = new Set(ownerFields.map(f => f.id));
            return allBookings.filter(b => ownerFieldIds.has(b.field.id));
        }
        return [];
    }, [user, allBookings, ownerFields]);
    
    const isFullscreenView = [View.LOGIN, View.REGISTER, View.FORGOT_PASSWORD, View.OWNER_REGISTER, View.OWNER_PENDING_VERIFICATION].includes(view);

    const renderView = () => {
        const homeComponent = <Home onSearch={handleSearch} onSelectField={handleSelectField} fields={fields} loading={loading} favoriteFields={user?.favoriteFields || []} onToggleFavorite={handleToggleFavorite} theme={theme} announcements={announcements} user={user} onSearchByLocation={handleSearchByLocation} isSearchingLocation={isSearchingLocation} weatherData={weatherData} isWeatherLoading={isWeatherLoading} />;
        
        const viewElement = (() => {
            switch (view) {
                case View.SEARCH_RESULTS:
                    return <SearchResults fields={searchResults} onSelectField={handleSelectField} onBack={() => handleNavigate(View.HOME, { isBack: true })} favoriteFields={user?.favoriteFields || []} onToggleFavorite={handleToggleFavorite} theme={theme} />;
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
                            fields: complexFields
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
                    return <ForgotPasswordView onNavigate={handleNavigate} addNotification={addNotification} />;
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
                                    addNotification={addNotification}
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
                                addNotification={addNotification}
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
                        return <SocialView user={user} addNotification={addNotification} onNavigate={handleNavigate} setIsPremiumModalOpen={setIsPremiumModalOpen} />;
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
    
    const showHeader = ![View.LOGIN, View.REGISTER, View.FORGOT_PASSWORD, View.PLAYER_PROFILE_CREATOR, View.OWNER_DASHBOARD, View.SUPER_ADMIN_DASHBOARD, View.OWNER_REGISTER, View.OWNER_PENDING_VERIFICATION].includes(view);
    const showBottomNav = user && !user.isOwner && !user.isAdmin && ![View.LOGIN, View.REGISTER, View.FORGOT_PASSWORD, View.BOOKING, View.BOOKING_CONFIRMATION, View.OWNER_DASHBOARD, View.PLAYER_PROFILE_CREATOR].includes(view);

    return (
        <div className="bg-slate-50 min-h-screen dark:bg-gray-900 transition-colors duration-300">
            <FirebaseWarningBanner />
            {showHeader && <Header user={user} onNavigate={handleNavigate} onLogout={handleLogout} notifications={notifications} onDismiss={dismissNotification} onMarkAllAsRead={() => {}} onClearAll={() => {}} />}
            <main className={`transition-all duration-300 overflow-x-hidden ${!showHeader ? '' : `container mx-auto px-4 py-6 sm:py-8 ${showBottomNav ? 'pb-28' : ''}`} ${view === View.PLAYER_PROFILE_CREATOR ? 'p-0 sm:p-0 max-w-full' : ''} ${isFullscreenView ? 'p-0 sm:p-0 max-w-full' : ''}`}>
                 {renderView()}
            </main>
            {showBottomNav && <BottomNav activeTab={activeTab} onNavigate={handleTabNavigate} />}
            <NotificationContainer notifications={notifications} onDismiss={dismissNotification} />
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
    );
};

export default App;
