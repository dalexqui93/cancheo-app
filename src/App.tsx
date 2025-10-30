// Fix: Implemented the main App component to manage state and routing.
// Fix: Corrected the React import to include useState, useEffect, and useCallback hooks.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { SoccerField, User, Notification, BookingDetails, ConfirmedBooking, Tab, Theme, AccentColor, PaymentMethod, CardPaymentMethod, Player, Announcement, Loyalty, UserLoyalty, Review, OwnerApplication } from './types';
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

    
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const [fieldsData, usersData, applicationsData, bookingsData] = await Promise.all([
                db.getFields(),
                db.getUsers(),
                db.getOwnerApplications(),
                db.getAllBookings(),
            ]);
            setFields(fieldsData);
            setAllUsers(usersData);
            setOwnerApplications(applicationsData);
            setAllBookings(bookingsData);
            setLoading(false);
        };
        loadData();
    }, []);

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
        setNotifications(prev => [{ ...notif, id: Date.now(), timestamp: new Date() }, ...prev]);
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
        // FIX: Correctly handle specific registration errors, such as duplicate emails, and provide appropriate user feedback. Fallback to a generic error for unexpected issues.
        } catch (error) {
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
                // FIX: Consolidated console.error arguments into a single string.
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
// FIX: Added type guard `instanceof Error` to safely access `error.message` and prevent potential runtime errors, improving code robustness.
        } catch (error) {
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
                // FIX: Pass error object as a separate argument to console.error to satisfy strict TypeScript rules and improve debugging.
                // FIX: Consolidated console.error arguments into a single string.
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
// FIX: Pass the whole `error` object to `console.error` for better debugging, instead of just `error.message`.
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Error de Reserva',
                message: 'No se pudo confirmar tu reserva. Por favor, inténtalo de nuevo.'
            });
            // FIX: Consolidated console.error arguments into a single string.
            console.error(`Booking confirmation error: ${String(error)}`);
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
        setUser