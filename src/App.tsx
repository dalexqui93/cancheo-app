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

// Sonido de notificación en formato Base64 para ser auto-contenido
const notificationSound = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAB3amZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZm';

const App = () => {
    const [fields, setFields] = useState<SoccerField[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [ownerApplications, setOwnerApplications] = useState<OwnerApplication[]>([]);
    const [allBookings, setAllBookings] = useState<ConfirmedBooking[]>([]);
    const [view, setView] = useState<View>(View.HOME);
    const [activeTab, setActiveTab] = useState<Tab>('explore');
    const [user, setUser] = useState<User | null>(