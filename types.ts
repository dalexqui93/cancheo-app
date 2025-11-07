
export enum View {
    HOME = 'HOME',
    SEARCH_RESULTS = 'SEARCH_RESULTS',
    FIELD_DETAIL = 'FIELD_DETAIL',
    BOOKING = 'BOOKING',
    BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
    LOGIN = 'LOGIN',
    REGISTER = 'REGISTER',
    OWNER_DASHBOARD = 'OWNER_DASHBOARD',
    PROFILE = 'PROFILE',
    BOOKINGS = 'BOOKINGS',
    BOOKING_DETAIL = 'BOOKING_DETAIL',
    SOCIAL = 'SOCIAL',
    PLAYER_PROFILE_CREATOR = 'PLAYER_PROFILE_CREATOR',
    APPEARANCE = 'APPEARANCE',
    HELP_SUPPORT = 'HELP_SUPPORT',
    PAYMENT_METHODS = 'PAYMENT_METHODS',
    FORGOT_PASSWORD = 'FORGOT_PASSWORD',
    OWNER_REGISTER = 'OWNER_REGISTER',
    OWNER_PENDING_VERIFICATION = 'OWNER_PENDING_VERIFICATION',
    SUPER_ADMIN_DASHBOARD = 'SUPER_ADMIN_DASHBOARD',
}

export type Tab = 'explore' | 'community' | 'bookings' | 'profile';

export type Theme = 'system' | 'light' | 'dark';

export type AccentColor = 'green' | 'blue' | 'orange' | 'purple';

export type FieldSize = '5v5' | '7v7' | '11v11';

export type OwnerStatus = 'pending' | 'approved' | 'rejected' | 'needs_correction';

export interface Service {
    name: string;
    icon: string;
}

export interface Review {
    id: string;
    author: string;
    rating: number;
    comment: string;
    timestamp: Date;
}

export interface SoccerField {
    id: string;
    complexId?: string;
    ownerId: string;
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
    loyaltyGoal: number;
    availableSlots?: {
        mañana: string[];
        tarde: string[];
        noche: string[];
    };
    distance?: number;
}

export interface Loyalty {
    progress: number;
    freeTickets: number;
}

export interface UserLoyalty {
    [fieldId: string]: Loyalty;
}

export type PaymentMethodType = 'card' | 'nequi' | 'daviplata' | 'pse';
export type CardBrand = 'Visa' | 'Mastercard' | 'American Express' | 'Otro';

interface BasePaymentMethod {
    id: string;
    type: PaymentMethodType;
    isDefault?: boolean;
}

export interface CardPaymentMethod extends BasePaymentMethod {
    type: 'card';
    brand: CardBrand;
    last4: string;
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

export interface Player {
    id: string;
    name: string;
    profilePicture?: string;
    number?: number;
    position: 'Portero' | 'Defensa' | 'Medio' | 'Delantero' | 'Cualquiera';
    level: 'Casual' | 'Intermedio' | 'Competitivo' | number;
    stats: {
        matchesPlayed: number;
        goals: number;
        assists: number;
        yellowCards: number;
        redCards: number;
    };
    age?: number;
    height?: number;
    weight?: number;
    dominantFoot?: 'Derecho' | 'Izquierdo' | 'Ambidiestro';
    bio?: string;
    strength?: number;
    speed?: number;
    stamina?: number;
    specialSkills?: string[];
    xp?: number;
    achievements?: string[];
}

export interface Notification {
    id: number;
    type: 'success' | 'info' | 'error';
    title: string;
    message: string;
    timestamp: Date;
    read?: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    profilePicture?: string;
    isOwner: boolean;
    isAdmin: boolean;
    ownerStatus?: OwnerStatus;
    isPremium: boolean;
    favoriteFields: string[];
    playerProfile?: Player;
    notifications?: Notification[];
    notificationPreferences?: {
        newAvailability: boolean;
        specialDiscounts: boolean;
        importantNews: boolean;
    };
    loyalty?: UserLoyalty;
    paymentMethods?: PaymentMethod[];
    cancheoCoins?: number;
    teamIds?: string[];
}

export interface BookingDetails {
    field: SoccerField;
    time: string;
    date: Date;
}

export interface ConfirmedBooking extends BookingDetails {
    id: string;
    status: 'confirmed' | 'cancelled' | 'completed';
    userId: string;
    userName: string;
    userPhone: string;
    extras: {
        balls: number;
        vests: number;
    };
    totalPrice: number;
    paymentMethod: string;
    isFree?: boolean;
    loyaltyApplied?: boolean;
    remindersSent?: {
        twentyFourHour: boolean;
        oneHour: boolean;
    };
    scoreA?: number;
    scoreB?: number;
    teamName?: string;
    rivalName?: string;
}

export interface Announcement {
    id?: string;
    title: string;
    message: string;
    type: 'news' | 'promo' | 'warning';
    ownerId: string;
    complexName: string;
    createdAt?: Date;
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
    locationName?: string;
    current: HourlyData;
    hourly: HourlyData[];
}

export type WeatherCondition = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'unknown';

export interface Favorability {
    status: 'Favorable' | 'Condicional' | 'Desfavorable';
    reason: string;
}

export type SocialSection = 'hub' | 'my-team' | 'sports-forum' | 'tournaments' | 'challenge' | 'find-players' | 'chat';

export type Formation = '4-4-2' | '4-3-3' | '3-5-2' | 'Custom';

export interface TeamEvent {
    id: string;
    type: 'match' | 'training' | 'event';
    date: Date;
    title: string;
    location: string;
}

export interface MatchEvent {
    // Define if needed
}

export interface Match {
    id: string;
    teamA: Team | { id: string, name: string, logo?: string };
    teamB: Team | { id: string, name: string, logo?: string };
    scoreA?: number;
    scoreB?: number;
    date: Date;
    status: 'programado' | 'jugado' | 'en vivo';
    isEditable?: boolean;
    events?: MatchEvent[];
}

export interface Team {
    id: string;
    name: string;
    logo?: string;
    captainId: string;
    players: Player[];
    level: 'Casual' | 'Intermedio' | 'Competitivo';
    stats: { wins: number; losses: number; draws: number };
    formation: Formation;
    playerPositions: { [playerId: string]: { x: number; y: number; pos?: string } };
    tacticsNotes?: string;
    schedule: TeamEvent[];
    matchHistory: Match[];
    messagingPermissions?: 'all' | 'captain';
    chat?: ChatMessage[];
}

export interface Group {
    id: string;
    name: string;
    teams: Team[];
    standings: any[];
    matches: Match[];
}

export interface KnockoutRound {
    // Define if needed
}

export interface Tournament {
    id: string;
    name: string;
    format: string;
    prize: string;
    status: 'en juego' | 'inscripciones abiertas' | 'finalizado';
    structure: 'groups-then-knockout' | 'knockout';
    teams: Team[];
    groups?: Group[];
    knockoutRounds?: KnockoutRound[];
}

export type SportsEmoji = '👍' | '⚽' | '🔥' | '🏆' | '🤯' | '😂' | '😡';

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
    isFlagged?: boolean;
    createdAt?: Date; // For firestore
}

export interface ForumPost {
    id: string;
    authorId: string;
    authorName: string;
    authorProfilePicture?: string;
    timestamp: Date;
    content: string;
    imageUrl?: string;
    tags: string[];
    reactions: ForumReaction[];
    comments: ForumComment[];
    isFlagged?: boolean;
    createdAt?: Date; // For firestore
    updatedAt?: Date; // For firestore
    commentCount?: number;
    reactionCounts?: { [key: string]: number };
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
    createdAt?: Date; // for firestore
}

export interface AvatarConfig {
    hairstyle: 'short' | 'buzz' | 'mohawk' | 'long' | 'ponytail' | 'bald';
    hairColor: string;
    skinTone: string;
    eyeColor?: string;
    facialHair: 'none' | 'moustache' | 'beard';
    jerseyColor: string;
    shortsColor: string;
    shoeColor?: string;
}
