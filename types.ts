// Basic types
export type Theme = 'system' | 'light' | 'dark';
export type AccentColor = 'green' | 'blue' | 'orange' | 'purple';
export type Tab = 'explore' | 'bookings' | 'community' | 'profile';
export type SocialSection = 'hub' | 'my-team' | 'sports-forum' | 'tournaments' | 'challenge' | 'find-players' | 'chat';

export enum View {
    HOME = 'HOME',
    SEARCH_RESULTS = 'SEARCH_RESULTS',
    FIELD_DETAIL = 'FIELD_DETAIL',
    BOOKING = 'BOOKING',
    BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
    LOGIN = 'LOGIN',
    REGISTER = 'REGISTER',
    OWNER_DASHBOARD = 'OWNER_DASHBOARD',
    SUPER_ADMIN_DASHBOARD = 'SUPER_ADMIN_DASHBOARD',
    PROFILE = 'PROFILE',
    BOOKINGS = 'BOOKINGS',
    BOOKING_DETAIL = 'BOOKING_DETAIL',
    APPEARANCE = 'APPEARANCE',
    HELP_SUPPORT = 'HELP_SUPPORT',
    PAYMENT_METHODS = 'PAYMENT_METHODS',
    SOCIAL = 'SOCIAL',
    PLAYER_PROFILE_CREATOR = 'PLAYER_PROFILE_CREATOR',
    FORGOT_PASSWORD = 'FORGOT_PASSWORD',
    OWNER_REGISTER = 'OWNER_REGISTER',
    OWNER_PENDING_VERIFICATION = 'OWNER_PENDING_VERIFICATION',
}

// Data models
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

export type FieldSize = '5v5' | '7v7' | '11v11';

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
    distance?: number;
    loyaltyEnabled?: boolean;
    loyaltyGoal?: number;
    availableSlots?: {
        mañana: string[];
        tarde: string[];
        noche: string[];
    };
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
    number?: number;
    position: 'Portero' | 'Defensa' | 'Medio' | 'Delantero' | 'Cualquiera';
    level: 'Casual' | 'Intermedio' | 'Competitivo' | number;
    stats: PlayerStats;
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

export type OwnerStatus = 'pending' | 'approved' | 'rejected' | 'needs_correction';

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // Should not be stored/retrieved on client but needed for mock data
    phone?: string;
    profilePicture?: string;
    isAdmin: boolean;
    isOwner: boolean;
    ownerStatus?: OwnerStatus;
    isPremium: boolean;
    favoriteFields: string[];
    notifications?: Notification[];
    notificationPreferences?: {
        newAvailability: boolean;
        specialDiscounts: boolean;
        importantNews: boolean;
    };
    loyalty?: UserLoyalty;
    paymentMethods?: PaymentMethod[];
    playerProfile?: Player;
    cancheoCoins?: number;
    teamIds?: string[];
}

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

export interface ConfirmedBooking {
    id: string;
    userId: string;
    userName: string;
    userPhone?: string;
    teamName?: string;
    rivalName?: string;
    field: SoccerField;
    date: Date;
    time: string;
    extras: {
        balls: number;
        vests: number;
    };
    totalPrice: number;
    paymentMethod: string;
    status: 'confirmed' | 'cancelled' | 'completed';
    remindersSent?: {
        twentyFourHour: boolean;
        oneHour: boolean;
    };
    isFree?: boolean;
    loyaltyApplied?: boolean;
    scoreA?: number;
    scoreB?: number;
}

export interface Announcement {
    id?: string;
    title: string;
    message: string;
    type: 'news' | 'promo' | 'warning';
    ownerId?: string;
    complexName?: string;
    createdAt?: Date;
}

export interface Loyalty {
    progress: number;
    freeTickets: number;
}
export type UserLoyalty = { [fieldId: string]: Loyalty };

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

// Payment Methods
export type CardBrand = 'Visa' | 'Mastercard' | 'American Express' | 'Otro';
export type PaymentMethodType = 'card' | 'nequi' | 'daviplata' | 'pse';

export interface BasePaymentMethod {
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

// Weather types
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
    locationName?: string;
    current: HourlyData;
    hourly: HourlyData[];
}
export interface Favorability {
    status: 'Favorable' | 'Condicional' | 'Desfavorable';
    reason: string;
}

// Team and Community types
export type Formation = '4-4-2' | '4-3-3' | '3-5-2' | 'Custom';
export interface MatchEvent {
    type: 'goal' | 'yellow' | 'red';
    minute: number;
    playerId: string;
    teamId: string;
}
export interface MatchTeam {
    id: string;
    name: string;
    logo?: string;
}
export interface Match {
    id: string;
    teamA: MatchTeam;
    teamB: MatchTeam;
    scoreA?: number;
    scoreB?: number;
    date: Date;
    status: 'por jugar' | 'en vivo' | 'jugado';
    events?: MatchEvent[];
    isEditable?: boolean;
}
export interface TeamEvent {
    id: string;
    type: 'match' | 'training' | 'event';
    date: Date;
    title: string;
    location: string;
}
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
    playerPositions: { [playerId: string]: { x: number; y: number; pos?: string } };
    tacticsNotes?: string;
    schedule: TeamEvent[];
    matchHistory: Match[];
    messagingPermissions?: 'all' | 'captain';
    latitude?: number;
    longitude?: number;
    distance?: number;
}

export interface Invitation {
    id: string;
    teamId: string;
    teamName: string;
    teamLogo?: string;
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    timestamp: Date;
}

export type SportsEmoji = '👍' | '😂' | '⚽' | '🔥' | '👏' | '🏆' | '🎉' | '💪' | '🤯' | '😡';
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
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderProfilePicture?: string;
    text: string;
    timestamp: Date;
    replyTo?: {
        messageId?: string;
        senderName: string;
        text: string;
    };
    deleted?: boolean;
    readBy?: string[];
    attachment?: {
      fileName: string;
      mimeType: string;
      dataUrl: string;
    };
}

export interface Group {
    id: string;
    name: string;
    teams: Team[];
    standings: any[];
    matches: Match[];
}
export interface KnockoutRound {
    name: string;
    matches: Match[];
}
export interface Tournament {
    id: string;
    name: string;
    format: 'Fútbol 5' | 'Fútbol 7' | 'Fútbol 11';
    prize: string;
    status: 'inscripciones abiertas' | 'en juego' | 'finalizado';
    structure: 'groups-then-knockout' | 'knockout';
    teams: Team[];
    groups?: Group[];
    knockoutRounds?: KnockoutRound[];
}

export interface AvatarConfig {
    skinTone: string;
    hairColor: string;
    hairstyle: 'short' | 'buzz' | 'mohawk' | 'long' | 'ponytail' | 'bald';
    facialHair: 'none' | 'moustache' | 'beard';
    eyeColor: string;
    jerseyColor: string;
    shortsColor: string;
    shoeColor: string;
}