// Fix: Added all necessary type definitions for the application.
export interface Review {
    id: string;
    author: string;
    rating: number;
    comment: string;
    timestamp: Date;
}

export interface Service {
    name: string;
    icon: string;
}

export type FieldSize = '5v5' | '7v7' | '11v11';

export interface SoccerField {
    id: string;
    name: string;
    address: string;
    city: string;
    department?: string;
    pricePerHour: number;
    rating: number;
    images: string[];
    description: string;
    services: Service[];
    reviews: Review[];
    size: FieldSize;
    latitude: number;
    longitude: number;
    loyaltyEnabled: boolean;
    loyaltyGoal: number; // Número de partidos para obtener uno gratis
    availableSlots?: {
        mañana: string[];
        tarde: string[];
        noche: string[];
    };
    complexId?: string;
    ownerId?: string;
    distance?: number;
}

// Fix: Added AvatarConfig interface to resolve import error in AvatarDisplay.tsx.
export interface AvatarConfig {
    hairstyle: 'short' | 'buzz' | 'mohawk' | 'long' | 'ponytail' | 'bald';
    hairColor: string;
    facialHair: 'none' | 'moustache' | 'beard';
    skinTone: string;
    eyeColor: string;
    jerseyColor: string;
    shortsColor: string;
    shoeColor: string;
}

export interface PlayerStats {
    matchesPlayed: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
}

export interface Player {
    id: string;
    name: string;
    profilePicture?: string;
    position: 'Portero' | 'Defensa' | 'Medio' | 'Delantero' | 'Cualquiera';
    level: 'Casual' | 'Intermedio' | 'Competitivo' | number; // Can be a string or the new number level
    stats: PlayerStats;
    number?: number;
    // New fields for player profile
    age?: number;
    favoriteTeam?: string;
    city?: string;
    height?: number; // cm
    weight?: number; // kg
    dominantFoot?: 'Derecho' | 'Izquierdo' | 'Ambidiestro';
    bio?: string;
    strength?: number; // 0-100
    speed?: number; // 0-100
    stamina?: number; // 0-100
    specialSkills?: string[];
    achievements?: {
        id: string;
        name: string;
        icon: string; // emoji
        date: string; // ISO string
    }[];
    xp?: number; // 0-1000 per level
}

export interface TeamEvent {
    id: string;
    type: 'match' | 'training' | 'event';
    date: Date;
    title: string;
    location: string;
    description?: string;
}

export type Formation = '4-4-2' | '4-3-3' | '3-5-2' | '5-3-2' | 'Custom';

export interface Team {
    id: string;
    name: string;
    logo?: string;
    captainId: string;
    players: Player[];
    level: 'Casual' | 'Intermedio' | 'Competitivo';
    stats: {
        wins: number;
        losses: number;
        draws: number;
    };
    formation: Formation;
    playerPositions: { [playerId: string]: { x: number; y: number } }; // Player positions on a 100x100 grid
    tacticsNotes?: string;
    schedule: TeamEvent[];
    matchHistory?: Match[];
}

export interface MatchEvent {
    id: string;
    type: 'goal' | 'yellow_card' | 'red_card' | 'assist';
    playerId: string;
    playerName: string; 
    teamId: string;
    minute: number;
}

export interface Match {
    id: string;
    teamA: Team | { id: string, name: string, logo?:string };
    teamB: Team | { id: string, name: string, logo?:string };
    scoreA?: number;
    scoreB?: number;
    date: Date;
    status: 'próximo' | 'jugado' | 'en juego';
    isEditable?: boolean;
    events?: MatchEvent[];
}

export interface Group {
    id: string;
    name: string;
    teams: Team[];
    standings: { team: Team; points: number; played: number; wins: number; draws: number; losses: number; gf: number; ga: number; gd: number; }[];
    matches: Match[];
}

export interface KnockoutRound {
    id:string;
    name: string;
    matches: Match[];
}

export interface Tournament {
    id: string;
    name: string;
    format: 'Fútbol 5' | 'Fútbol 7' | 'Fútbol 11';
    prize: string;
    status: 'inscripciones abiertas' | 'en juego' | 'finalizado';
    teams: Team[];
    structure: 'groups-then-knockout' | 'knockout' | 'league';
    groups?: Group[];
    knockoutRounds?: KnockoutRound[];
}

export type PaymentMethodType = 'card' | 'nequi' | 'daviplata' | 'pse';
export type CardBrand = 'Visa' | 'Mastercard' | 'American Express' | 'Otro';

export interface BasePaymentMethod {
    id: string;
    type: PaymentMethodType;
    isDefault?: boolean;
}

export interface CardPaymentMethod extends BasePaymentMethod {
    type: 'card';
    last4: string;
    brand: CardBrand;
    expiryMonth: string;
    expiryYear: string;
}

export interface WalletPaymentMethod extends BasePaymentMethod {
    type: 'nequi' | 'daviplata';
    phoneNumber: string;
}

export interface PsePaymentMethod extends BasePaymentMethod {
    type: 'pse';
    accountHolderName: string;
}

export type PaymentMethod = CardPaymentMethod | WalletPaymentMethod | PsePaymentMethod;

export interface Loyalty {
    progress: number; // 0-7
    freeTickets: number;
}

export type UserLoyalty = Record<string, Loyalty>;

export type OwnerStatus = 'pending' | 'approved' | 'rejected' | 'needs_correction';

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    isOwner: boolean;
    isAdmin: boolean;
    favoriteFields: string[];
    profilePicture?: string;
    phone?: string;
    notificationPreferences?: {
        newAvailability: boolean;
        specialDiscounts: boolean;
        importantNews: boolean;
    };
    teamId?: string;
    paymentMethods?: PaymentMethod[];
    playerProfile?: Player;
    isPremium?: boolean;
    loyalty?: UserLoyalty;
    ownerStatus?: OwnerStatus;
    notifications?: Notification[];
    cancheoCoins?: number;
}

export interface OwnerApplication {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    complexName: string;
    address: string;
    phone: string;
    rutFileName: string;
    photoFileNames: string[];
    status: OwnerStatus;
    rejectionReason?: string;
}

export enum View {
    HOME,
    SEARCH_RESULTS,
    FIELD_DETAIL,
    BOOKING,
    BOOKING_CONFIRMATION,
    LOGIN,
    PROFILE,
    OWNER_DASHBOARD,
    BOOKINGS,
    BOOKING_DETAIL,
    APPEARANCE,
    HELP_SUPPORT,
    SOCIAL,
    PAYMENT_METHODS,
    PLAYER_PROFILE_CREATOR,
    REGISTER,
    FORGOT_PASSWORD,
    OWNER_REGISTER,
    OWNER_PENDING_VERIFICATION,
    SUPER_ADMIN_DASHBOARD,
}

export type Tab = 'explore' | 'bookings' | 'community' | 'profile';

export type Theme = 'light' | 'dark' | 'system';

export type AccentColor = 'green' | 'blue' | 'orange' | 'purple';

export interface Notification {
    id: number;
    type: 'success' | 'info' | 'error';
    title: string;
    message: string;
    timestamp: Date;
    read?: boolean;
}

export interface BookingDetails {
    field: SoccerField;
    time: string;
    date: Date;
}

export interface ConfirmedBooking extends BookingDetails {
    id:string;
    userId: string;
    userName: string;
    userPhone?: string;
    extras: { balls: number; vests: number };
    totalPrice: number;
    paymentMethod: string; // 'cash' or a payment method ID
    status?: 'confirmed' | 'cancelled';
    remindersSent?: {
        twentyFourHour: boolean;
        oneHour: boolean;
    };
    isFree?: boolean;
    loyaltyApplied?: boolean;
    ratingPrompted?: boolean;
}

export interface Announcement {
    id: string;
    title: string;
    message: string;
    type: 'news' | 'offer';
    createdAt: Date;
    ownerId: string;
    complexName: string;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderProfilePicture?: string;
    text: string;
    timestamp: Date;
    replyTo?: {
        senderName: string;
        text: string;
    };
}

export type SportsEmoji = '👍' | '⚽' | '🔥' | '🤯' | '😂' | '😡' | '🏆';

export interface ForumReaction {
    emoji: SportsEmoji;
    userIds: string[];
}

export interface ForumComment {
    id: string;
    authorId: string;
    authorName: string;
    authorProfilePicture?: string;
    timestamp: Date;
    content: string;

    reactions: ForumReaction[];
}

export interface ForumPost {
    id: string;
    authorId: string;
    authorName: string;
    authorProfilePicture?: string;
    timestamp: Date;
    content: string;
    imageUrl?: string;
    tags?: string[];
    reactions: ForumReaction[];
    comments: ForumComment[];
}

// --- Weather Module Types ---

export type WeatherCondition = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'unknown';

export interface HourlyData {
  time: Date;
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  windSpeed: number;
  weatherCode: number;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  lastUpdated: Date;
  current: HourlyData;
  hourly: HourlyData[];
  locationName?: string;
}

export interface Favorability {
    status: 'Favorable' | 'Condicional' | 'Desfavorable';
    reason: string;
}