// @ts-nocheck
import type { SoccerField, User, ConfirmedBooking, OwnerApplication, Review, Announcement, Player, Team, TeamEvent, Match, ForumPost, ChatMessage, Invitation } from './types';

// DECLARACIÓN GLOBAL PARA FIREBASE
declare const firebase: any;

// --- CONFIGURACIÓN DE FIREBASE ---
// IMPORTANTE: Reemplaza este objeto con la configuración de tu propio proyecto de Firebase.
// Puedes encontrarla en la consola de Firebase > Configuración del proyecto.
const firebaseConfig = {
  apiKey: "AIzaSyCn4Drk464A9ByYduuDFwwBSF3elnuId1A",
  authDomain: "canchalibre-519f9.firebaseapp.com",
  projectId: "canchalibre-519f9",
  storageBucket: "canchalibre-519f9.firebasestorage.app",
  messagingSenderId: "924697991123",
  appId: "1:924697991123:web:73a6d20dd674d8f27b0126",
  measurementId: "G-EVH9JKPE2Q"
};


// --- INICIALIZACIÓN CONDICIONAL ---
// Revisa si las credenciales han sido reemplazadas.
export const isFirebaseConfigured = firebaseConfig.apiKey !== "TU_API_KEY" && firebaseConfig.projectId !== "TU_PROJECT_ID";

let db: any;

if (isFirebaseConfigured) {
    try {
        if (typeof firebase !== 'undefined' && !firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
        } else if (typeof firebase !== 'undefined') {
            db = firebase.firestore();
        }
    } catch (e) {
        // FIX: Explicitly convert error to string for consistent and safe logging.
        console.error('Error al inicializar Firebase. Revisa tus credenciales en database.ts:', String(e));
    }
} else {
    console.warn("ATENCIÓN: Firebase no está configurado. La aplicación se ejecutará en modo de demostración con datos locales. Edita el archivo 'database.ts' con tus credenciales para habilitar la persistencia.");
}

// =============================================================================
// DATOS PARA MODO DEMO Y SEEDING
// =============================================================================

const opponentNames = ['Los Titanes', 'Atlético Barrial', 'Furia Roja FC', 'Deportivo Amigos', 'Guerreros FC', 'Leyendas Urbanas'];

// --- Definiciones de Datos Consistentes ---

const adminId = 'admin-user';
const owner1Id = 'owner-1';
const owner2Id = 'owner-2';

const playersToSeed: Player[] = [
    { 
        id: 'player-1', name: 'Juan Perez', profilePicture: 'https://i.pravatar.cc/150?u=juanperez', number: 9, position: 'Delantero', level: 'Competitivo', stats: { matchesPlayed: 15, goals: 12, assists: 4, yellowCards: 3, redCards: 0 },
        age: 28, height: 182, weight: 78, dominantFoot: 'Derecho', bio: 'Delantero rápido y letal en el área. Siempre buscando el gol.', strength: 85, speed: 92, stamina: 88, specialSkills: ['Tiro Potente', 'Regate Rápido', 'Cabeceo'], xp: 750
    },
    { 
        id: 'player-2', name: 'Ana García', profilePicture: 'https://i.pravatar.cc/150?u=anagarcia', number: 4, position: 'Defensa', level: 'Competitivo', stats: { matchesPlayed: 15, goals: 1, assists: 2, yellowCards: 5, redCards: 0 },
        age: 26, height: 170, weight: 65, dominantFoot: 'Derecho', bio: 'Defensa central sólida y con buen juego aéreo.', strength: 90, speed: 75, stamina: 85, specialSkills: ['Defensa Férrea', 'Marcaje', 'Cabeceo'], xp: 720
    },
    { 
        id: 'player-3', name: 'Luis Fernandez', profilePicture: 'https://i.pravatar.cc/150?u=luisfernandez', number: 10, position: 'Medio', level: 'Competitivo', stats: { matchesPlayed: 15, goals: 6, assists: 9, yellowCards: 1, redCards: 0 },
        age: 30, height: 175, weight: 72, dominantFoot: 'Ambidiestro', bio: 'Mediocampista creativo con gran visión de juego.', strength: 78, speed: 82, stamina: 90, specialSkills: ['Visión de Juego', 'Pase Preciso', 'Regate Rápido'], xp: 810
    },
    { 
        id: 'player-4', name: 'Marta Gomez', profilePicture: 'https://i.pravatar.cc/150?u=martagomez', number: 1, position: 'Portero', level: 'Competitivo', stats: { matchesPlayed: 15, goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
        age: 24, height: 185, weight: 80, dominantFoot: 'Derecho', bio: 'Portera con excelentes reflejos y segura en el mano a mano.', strength: 88, speed: 80, stamina: 82, specialSkills: ['Portero Ágil', 'Liderazgo'], xp: 680
    },
];

const usersToSeed = [
    { id: adminId, name: 'Admin', email: 'admin@cancheo.com', password: 'admin123', isAdmin: true, isOwner: false, favoriteFields: [], isPremium: true, notifications: [], notificationPreferences: { newAvailability: true, specialDiscounts: true, importantNews: true }, cancheoCoins: 1000 },
    { id: owner1Id, name: 'Propietario Templo', email: 'owner1@cancheo.com', password: 'owner123', isOwner: true, ownerStatus: 'approved', isAdmin: false, favoriteFields: [], isPremium: false, notifications: [], notificationPreferences: { newAvailability: true, specialDiscounts: true, importantNews: true }, cancheoCoins: 100 },
    { id: owner2Id, name: 'Propietario Gol', email: 'owner2@cancheo.com', password: 'owner123', isOwner: true, ownerStatus: 'approved', isAdmin: false, favoriteFields: [], isPremium: false, notifications: [], notificationPreferences: { newAvailability: true, specialDiscounts: true, importantNews: true }, cancheoCoins: 100 },
    ...playersToSeed.map(player => ({
        id: player.id,
        name: player.name,
        email: `${player.name.split(' ')[0].toLowerCase()}@test.com`,
        password: 'password123',
        isOwner: false,
        isAdmin: false,
        favoriteFields: player.id === 'player-1' ? ['complex-1'] : [],
        profilePicture: player.profilePicture,
        phone: `300${Math.floor(1000000 + Math.random() * 9000000)}`,
        notificationPreferences: { newAvailability: true, specialDiscounts: true, importantNews: true },
        isPremium: player.id === 'player-1',
        loyalty: player.id === 'player-1' ? { 'field-1': { progress: 3, freeTickets: 1 } } : {},
        cancheoCoins: player.id === 'player-1' ? 250 : 100,
        notifications: player.id === 'player-1' ? [{ id: Date.now(), type: 'info', title: '¡Bienvenido a Cancheo!', message: 'Gracias por registrarte. ¡Disfruta de tu bono de 100 Cancheo Coins!', timestamp: new Date() }] : [],
        teamIds: ['t1'],
        playerProfile: player,
    }))
];

const fieldsToSeed = [
  {
    id: 'field-1', complexId: 'complex-1', ownerId: owner1Id, name: 'El Templo del Fútbol - Cancha 1', address: 'Calle 123 #45-67', city: 'Bogotá', department: 'Cundinamarca', pricePerHour: 90000, rating: 4.5,
    images: ['https://i.pinimg.com/736x/47/33/3e/47333e07ed4963aa120c821b597d0f8e.jpg', 'https://i.pinimg.com/736x/ee/5b/8d/ee5b8d1fe632960104478b7c5b883c85.jpg'],
    description: 'El mejor lugar para jugar con tus amigos. Canchas de última generación con césped sintético de alta calidad.',
    services: [ { name: 'Vestuarios', icon: '👕' }, { name: 'Cafetería', icon: '☕' }, { name: 'Parqueadero', icon: '🅿️' } ],
    reviews: [
        { id: 'r1', author: 'Juan Perez', rating: 5, comment: 'Excelente cancha, muy bien cuidada. El césped está en perfectas condiciones.', timestamp: new Date('2024-07-20T10:00:00Z') },
        { id: 'r2', author: 'Maria Rodriguez', rating: 4, comment: 'Muy buenas instalaciones, aunque a veces es difícil conseguir reserva. Recomiendo planificar con tiempo.', timestamp: new Date('2024-07-18T15:30:00Z') },
    ],
    size: '5v5', latitude: 4.648283, longitude: -74.088951, loyaltyEnabled: true, loyaltyGoal: 7,
  },
  {
    id: 'field-2', complexId: 'complex-1', ownerId: owner1Id, name: 'El Templo del Fútbol - Cancha 2', address: 'Calle 123 #45-67', city: 'Bogotá', department: 'Cundinamarca', pricePerHour: 120000, rating: 4.8,
    images: ['https://i.pinimg.com/736x/7f/b7/3c/7fb73cf022f824a1443d5c9081cfe618.jpg', 'https://i.pinimg.com/736x/a5/7a/fa/a57afa6abeaeb64f8f2a1a0689e9a3f8.jpg'],
    description: 'El mejor lugar para jugar con tus amigos. Canchas de última generación con césped sintético de alta calidad.',
    services: [ { name: 'Vestuarios', icon: '👕' }, { name: 'Cafetería', icon: '☕' }, { name: 'Parqueadero', icon: '🅿️' } ],
    reviews: [], size: '7v7', latitude: 4.648283, longitude: -74.088951, loyaltyEnabled: true, loyaltyGoal: 7,
  },
  {
    id: 'field-3', complexId: 'complex-2', ownerId: owner2Id, name: 'Gol Center - Cancha A', address: 'Avenida 68 #90-12', city: 'Medellín', department: 'Antioquia', pricePerHour: 75000, rating: 4.5,
    images: ['https://i.pinimg.com/originals/7f/e1/99/7fe1991a0c74a7b73c4e33989e24634f.jpg', 'https://i.pinimg.com/originals/1c/c7/2b/1cc72b7a957252277d3f0a9903b418a0.jpg'],
    description: 'Canchas económicas y de buena calidad en el corazón de la ciudad. Ideal para partidos casuales.',
    services: [ { name: 'Balones', icon: '⚽' }, { name: 'Tienda', icon: '🏪' } ],
    reviews: [ { id: 'r3', author: 'Carlos Diaz', rating: 4, comment: 'Buen precio y la cancha está bien.', timestamp: new Date() } ],
    size: '5v5', latitude: 6.25184, longitude: -75.56359, loyaltyEnabled: true, loyaltyGoal: 10,
  }
];

const teamsToSeed: Team[] = [
    {
        id: 't1', name: 'Los Galácticos', captainId: 'player-1', players: playersToSeed,
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iIzAzM0E2MyIgc3Ryb2tlPSIjRkZGIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNNTAsMjVsNS44NzgsMTEuOTcgMTMuMjIuOTU2LTkuNjg2LDguNzYgMi4wOCwxMy4wMTRMNTAsNTMuNmwtMTEuOTEyLDcuMSAyLjUtMTMuMDE0LTkuNjg2LTguNzYgMTMuMjItLjk1NloiIGZpbGw9IiNGRkYiLz48L3N2Zz4=',
        level: 'Competitivo', stats: { wins: 1, losses: 0, draws: 1 },
        formation: '4-3-3',
        playerPositions: {},
        tacticsNotes: "Presión alta al rival. Salida rápida por las bandas. El #10 tiene libertad de movimiento.",
        schedule: [
            { id: 'ev1', type: 'match', date: new Date(new Date().setDate(new Date().getDate() + 3)), title: 'vs. Atlético Panas', location: 'Gol Center Envigado' },
            { id: 'ev2', type: 'training', date: new Date(new Date().setDate(new Date().getDate() + 5)), title: 'Entrenamiento Táctico', location: 'Cancha El Templo' },
        ],
        matchHistory: [
            { id: 'mh1', teamA: {id: 't1', name: 'Los Galácticos'}, teamB: {id: 'ext1', name: 'Rivales FC'}, scoreA: 3, scoreB: 3, date: new Date('2024-07-20'), status: 'jugado'},
            { id: 'mh2', teamA: {id: 't1', name: 'Los Galácticos'}, teamB: {id: 'ext2', name: 'Deportivo Amigos'}, scoreA: 5, scoreB: 2, date: new Date('2024-07-13'), status: 'jugado'},
        ],
        latitude: 4.648283, 
        longitude: -74.088951,
    },
     {
        id: 't2', name: 'Furia Roja FC', captainId: 'ext-captain-1', players: [],
        level: 'Intermedio', stats: { wins: 5, losses: 2, draws: 3 },
        formation: '4-4-2', playerPositions: {}, schedule: [], matchHistory: [],
        latitude: 6.25184,
        longitude: -75.56359,
    },
    {
        id: 't3', name: 'Atlético Barrial', captainId: 'ext-captain-2', players: [],
        level: 'Casual', stats: { wins: 2, losses: 6, draws: 2 },
        formation: '4-4-2', playerPositions: {}, schedule: [], matchHistory: [],
        latitude: 6.2442,
        longitude: -75.5812,
    },
];

const postsToSeed: ForumPost[] = [
    {
        id: 'post1', authorId: 'player-2', authorName: 'Ana García', authorProfilePicture: 'https://i.pravatar.cc/150?u=anagarcia',
        timestamp: new Date(new Date().getTime() - 1000 * 60 * 5),
        content: '¡Qué partidazo el de anoche! El gol de último minuto fue increíble. ¿Creen que el equipo mantendrá este nivel en la final?',
        imageUrl: 'https://picsum.photos/seed/partido1/1200/800', tags: ['Fútbol', 'Debate'],
        reactions: [ { emoji: '🔥', userIds: ['player-1', 'player-3'] }, { emoji: '⚽', userIds: ['player-4'] } ],
        comments: [
            { id: 'c1', authorId: 'player-3', authorName: 'Luis Fernandez', authorProfilePicture: 'https://i.pravatar.cc/150?u=luisfernandez', timestamp: new Date(new Date().getTime() - 1000 * 60 * 3), content: 'Totalmente de acuerdo, la defensa estuvo impecable.', reactions: [{ emoji: '👍', userIds: ['player-2'] }] },
            { id: 'c2', authorId: 'player-1', authorName: 'Juan Perez', authorProfilePicture: 'https://i.pravatar.cc/150?u=juanperez', timestamp: new Date(new Date().getTime() - 1000 * 60 * 2), content: 'No estoy tan seguro, el mediocampo perdió muchos balones en la segunda mitad. Hay que mejorar eso.', reactions: [] },
        ],
    }
];

const announcementsToSeed = [
    { title: '¡Torneo de Verano!', message: 'Inscripciones abiertas para nuestro torneo de verano en El Templo del Fútbol. ¡Grandes premios!', type: 'news', ownerId: owner1Id, complexName: 'El Templo del Fútbol' }
];


// --- FUNCIÓN DE SEEDING ---
export const seedDatabase = async () => {
    if (!db) return;

    const usersCollection = db.collection('users');
    const adminQuery = await usersCollection.where('email', '==', 'admin@cancheo.com').limit(1).get();

    if (!adminQuery.empty) {
        return; // La base de datos ya parece tener datos
    }

    console.log("Base de datos vacía, poblando con datos de ejemplo...");
    const batch = db.batch();

    // Añadir usuarios
    usersToSeed.forEach(user => {
        const { id, ...data } = user;
        const userRef = usersCollection.doc(id);
        batch.set(userRef, data);
    });

    // Añadir canchas
    const fieldsCollection = db.collection('fields');
    fieldsToSeed.forEach(field => {
        const { id, ...data } = field;
        const fieldRef = fieldsCollection.doc(id);
        batch.set(fieldRef, {...data, createdAt: firebase.firestore.FieldValue.serverTimestamp()});
    });

    // Añadir equipos
    const teamsCollection = db.collection('teams');
    teamsToSeed.forEach(team => {
        const { id, ...data } = team;
        const teamRef = teamsCollection.doc(id);
        batch.set(teamRef, data);
    });
    
    // Añadir posts
    const postsCollection = db.collection('posts');
    postsToSeed.forEach(post => {
        const { id, ...data } = post;
        const postRef = postsCollection.doc(id);
        const dataToSave = {
            ...data,
            timestamp: firebase.firestore.Timestamp.fromDate(post.timestamp),
            createdAt: firebase.firestore.Timestamp.fromDate(post.timestamp),
            comments: post.comments.map(c => ({
                ...c,
                timestamp: firebase.firestore.Timestamp.fromDate(c.timestamp),
                createdAt: firebase.firestore.Timestamp.fromDate(c.timestamp),
            }))
        };
        batch.set(postRef, dataToSave);
    });

    // Añadir anuncios
    const announcementsCollection = db.collection('announcements');
    announcementsToSeed.forEach(announcementData => {
        const announcementRef = announcementsCollection.doc();
        batch.set(announcementRef, {...announcementData, createdAt: firebase.firestore.FieldValue.serverTimestamp()});
    });

    try {
        await batch.commit();
        console.log("Base de datos poblada exitosamente.");
    } catch (error) {
        // FIX: Explicitly convert error to string for consistent and safe logging.
        console.error("Error al poblar la base de datos:", String(error));
    }
};

// --- API DE LA BASE DE DATOS ---

// -- Helpers ---
const docToData = (doc) => {
    const data = doc.data();
    // Convierte Timestamps de Firestore a objetos Date de JS de forma recursiva
    const convertTimestamps = (obj) => {
        if (!obj) return;
        for (const key in obj) {
            if (obj[key] && typeof obj[key].toDate === 'function') {
                obj[key] = obj[key].toDate();
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                convertTimestamps(obj[key]);
            }
        }
    };
    convertTimestamps(data);
    return { id: doc.id, ...data };
};

const getCollection = async (collectionName) => {
    if (!db) return [];
    try {
        const snapshot = await db.collection(collectionName).get();
        return snapshot.docs.map(docToData);
    } catch (error) {
        // FIX: Explicitly convert error to string for consistent and safe logging.
        console.error(`Error obteniendo la colección ${collectionName}:`, String(error));
        return [];
    }
};

// --- MODO DEMO (LOCAL) ---

const demoData = {
    users: [],
    fields: [],
    bookings: [],
    ownerApplications: [],
    announcements: [],
    teams: [],
    posts: [],
    chats: {},
    invitations: [],
};

const initializeDemoData = () => {
    demoData.users = usersToSeed.map(({id, ...data}) => ({id, ...data}));
    demoData.fields = fieldsToSeed.map(({id, ...data}) => ({id, ...data, reviews: data.reviews.map(r => ({...r, timestamp: new Date(r.timestamp)}))}));
    demoData.teams = teamsToSeed;
    demoData.posts = postsToSeed;
    demoData.announcements = announcementsToSeed.map((a, i) => ({ id: `announcement-${i}`, ...a, createdAt: new Date() }));
    demoData.chats['t1'] = [
        { id: 'msg1', senderId: 'player-2', senderName: 'Ana García', text: 'Hola equipo, ¿listos para el partido del sábado?', timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 3), readBy: ['player-1', 'player-3'] },
        { id: 'msg2', senderId: 'player-1', senderName: 'Juan Perez', text: '¡Claro que sí! Con toda.', timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 2.5), replyTo: { messageId: 'msg1', senderName: 'Ana García', text: 'Hola equipo, ¿listos pa...' }, readBy: ['player-2'] },
    ];
    demoData.invitations = [];

    const nowForBooking = new Date();
    const liveStartTime = new Date(nowForBooking.getTime() - 30 * 60 * 1000); 
    const upcomingStartTime = new Date(nowForBooking.getTime() + 24 * 60 * 60 * 1000); 
    const completedStartTime = new Date(nowForBooking.getTime() - 2 * 24 * 60 * 60 * 1000); 

    demoData.bookings = [
        { id: 'booking-live', field: demoData.fields[1], time: `${String(liveStartTime.getHours()).padStart(2, '0')}:${String(liveStartTime.getMinutes()).padStart(2, '0')}`, date: liveStartTime, userId: 'player-1', userName: 'Juan Perez', teamName: 'Los Galácticos', rivalName: 'Los Invencibles', userPhone: '3110000001', extras: { balls: 0, vests: 1 }, totalPrice: 130000, paymentMethod: 'cash', status: 'confirmed', scoreA: 1, scoreB: 0 },
        { id: 'booking-upcoming-1', field: demoData.fields[0], time: '19:00', date: upcomingStartTime, userId: 'player-1', userName: 'Juan Perez', teamName: 'Los Galácticos', rivalName: 'Furia Roja FC', userPhone: '3110000002', extras: { balls: 1, vests: 0 }, totalPrice: 95000, paymentMethod: 'card-1', status: 'confirmed' },
        { 
            id: 'booking-completed-1', 
            field: demoData.fields[2], 
            time: '20:00', 
            date: completedStartTime, 
            userId: 'player-1', 
            userName: 'Juan Perez', 
            teamName: 'Los Galácticos', 
            rivalName: 'Atlético Barrial', 
            userPhone: '3110000003', 
            extras: { balls: 0, vests: 0 }, 
            totalPrice: 75000, 
            paymentMethod: 'cash', 
            status: 'completed', 
            scoreA: 5, 
            scoreB: 3 
        }
    ];
};

if (!isFirebaseConfigured) {
    initializeDemoData();
}

// --- FUNCIONES DE LA API ---

export const listenToAllBookings = (callback) => {
    if (isFirebaseConfigured) {
        return db.collection('bookings').onSnapshot(async (snapshot) => {
            const bookings = snapshot.docs.map(docToData);
            const fieldsSnapshot = await db.collection('fields').get();
            const fieldMap = new Map(fieldsSnapshot.docs.map(doc => [doc.id, docToData(doc)]));
            const populatedBookings = bookings.map(b => ({ ...b, field: fieldMap.get(b.fieldId) || b.field }));
            callback(populatedBookings);
        });
    }
    return () => {}; 
};

export const listenToAllTeams = (callback) => {
    if (isFirebaseConfigured) {
        return db.collection('teams').onSnapshot(snapshot => {
            callback(snapshot.docs.map(docToData));
        });
    }
    return () => {};
}

export const getFields = async () => {
    if (isFirebaseConfigured) return getCollection('fields');
    return Promise.resolve(JSON.parse(JSON.stringify(demoData.fields)));
};

export const getUsers = async () => {
    if (isFirebaseConfigured) return getCollection('users');
    return Promise.resolve(JSON.parse(JSON.stringify(demoData.users)));
};

export const getTeams = async (): Promise<Team[]> => {
    if (isFirebaseConfigured) return getCollection('teams');
    const reviver = (key, value) => {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
            return new Date(value);
        }
        return value;
    };
    return Promise.resolve(JSON.parse(JSON.stringify(demoData.teams), reviver));
};

export const getAllBookings = async () => {
    if (isFirebaseConfigured) {
        const bookings = await getCollection('bookings');
        const fields = await getCollection('fields');
        const fieldMap = new Map(fields.map(f => [f.id, f]));
        return bookings.map(b => ({ ...b, field: fieldMap.get(b.fieldId) || b.field }));
    }
    return Promise.resolve(JSON.parse(JSON.stringify(demoData.bookings), (key, value) => {
        if (key === 'date') return new Date(value);
        return value;
    }));
};

export const getOwnerApplications = async () => {
    if (isFirebaseConfigured) return getCollection('owner_applications');
    return Promise.resolve(JSON.parse(JSON.stringify(demoData.ownerApplications)));
};

export const getAnnouncements = async () => {
    if (isFirebaseConfigured) return getCollection('announcements');
    return Promise.resolve(JSON.parse(JSON.stringify(demoData.announcements)));
};

export const addUser = async (userData) => {
    if (isFirebaseConfigured) {
        const usersRef = db.collection('users');
        const existing = await usersRef.where('email', '==', userData.email).limit(1).get();
        if (!existing.empty) {
            throw new Error('DUPLICATE_EMAIL');
        }
        const docRef = await usersRef.add(userData);
        return { id: docRef.id, ...userData };
    }
    if (demoData.users.some(u => u.email === userData.email)) {
        throw new Error('DUPLICATE_EMAIL');
    }
    const newUser = { id: `user-${Date.now()}`, ...userData };
    demoData.users.push(newUser);
    return Promise.resolve(newUser);
};

export const updateUser = async (userId, updates) => {
    if (isFirebaseConfigured) {
        return db.collection('users').doc(userId).update(updates);
    }
    const userIndex = demoData.users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        Object.keys(updates).forEach(key => {
            if (key.includes('.')) {
                const [parent, child] = key.split('.');
                demoData.users[userIndex][parent] = { ...demoData.users[userIndex][parent], [child]: updates[key] };
            } else {
                demoData.users[userIndex] = { ...demoData.users[userIndex], ...updates };
            }
        });
    }
    return Promise.resolve();
};

export const removeUserField = async (userId, fieldsToRemove) => {
    if (isFirebaseConfigured) {
        const updates = {};
        fieldsToRemove.forEach(field => {
            updates[field] = firebase.firestore.FieldValue.delete();
        });
        return db.collection('users').doc(userId).update(updates);
    }
    const userIndex = demoData.users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        fieldsToRemove.forEach(field => {
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                if (demoData.users[userIndex][parent]) {
                    delete demoData.users[userIndex][parent][child];
                }
            } else {
                delete demoData.users[userIndex][field];
            }
        });
    }
    return Promise.resolve();
};

export const addBooking = async (bookingData) => {
    const dataWithMatchDetails = { ...bookingData };
    if (!dataWithMatchDetails.teamName) {
        dataWithMatchDetails.teamName = dataWithMatchDetails.userName;
    }
    if (!dataWithMatchDetails.rivalName) {
        dataWithMatchDetails.rivalName = opponentNames[Math.floor(Math.random() * opponentNames.length)];
    }

    const dataToSave = { ...dataWithMatchDetails, fieldId: dataWithMatchDetails.field.id };
    delete dataToSave.field;

    if (isFirebaseConfigured) {
        const docRef = await db.collection('bookings').add(dataToSave);
        return { id: docRef.id, ...dataWithMatchDetails };
    }
    const newBooking = { id: `booking-${Date.now()}`, ...dataWithMatchDetails };
    demoData.bookings.push(newBooking);
    return Promise.resolve(newBooking);
};

export const updateBooking = async (bookingId, updates) => {
    if (isFirebaseConfigured) {
        return db.collection('bookings').doc(bookingId).update(updates);
    }
    const bookingIndex = demoData.bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex > -1) {
        demoData.bookings[bookingIndex] = { ...demoData.bookings[bookingIndex], ...updates };
    }
    return Promise.resolve();
};

export const addOwnerApplication = async (appData) => {
    if (isFirebaseConfigured) {
        const docRef = await db.collection('owner_applications').add(appData);
        return { id: docRef.id, ...appData };
    }
    const newApp = { id: `app-${Date.now()}`, ...appData };
    demoData.ownerApplications.push(newApp);
    return Promise.resolve(newApp);
};

export const addReviewToField = async (fieldId, review) => {
    if (isFirebaseConfigured) {
        const fieldRef = db.collection('fields').doc(fieldId);
        return fieldRef.update({
            reviews: firebase.firestore.FieldValue.arrayUnion(review)
        });
    }
    const fieldIndex = demoData.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex > -1) {
        demoData.fields[fieldIndex].reviews.unshift(review);
    }
    return Promise.resolve();
};

export const addAnnouncement = async (announcementData) => {
    if (isFirebaseConfigured) {
        const docRef = await db.collection('announcements').add({ ...announcementData, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        return { id: docRef.id, ...announcementData, createdAt: new Date() };
    }
    const newAnnouncement = { id: `ann-${Date.now()}`, ...announcementData, createdAt: new Date() };
    demoData.announcements.unshift(newAnnouncement);
    return Promise.resolve(newAnnouncement);
};

export const deleteAnnouncement = async (announcementId) => {
    if (isFirebaseConfigured) {
        return db.collection('announcements').doc(announcementId).delete();
    }
    demoData.announcements = demoData.announcements.filter(a => a.id !== announcementId);
    return Promise.resolve();
};

export const addField = async (fieldData) => {
    if (isFirebaseConfigured) {
        const docRef = await db.collection('fields').add(fieldData);
        return { id: docRef.id, ...fieldData };
    }
    const newField = { id: `field-${Date.now()}`, ...fieldData };
    demoData.fields.push(newField);
    return Promise.resolve(newField);
};

export const updateField = async (fieldId, updates) => {
    if (isFirebaseConfigured) {
        return db.collection('fields').doc(fieldId).update(updates);
    }
    const fieldIndex = demoData.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex > -1) {
        demoData.fields[fieldIndex] = { ...demoData.fields[fieldIndex], ...updates };
    }
    return Promise.resolve();
};

export const deleteField = async (fieldId) => {
    if (isFirebaseConfigured) {
        return db.collection('fields').doc(fieldId).delete();
    }
    demoData.fields = demoData.fields.filter(f => f.id !== fieldId);
    return Promise.resolve();
};

export const updateTeam = async (teamId, updates) => {
    if (isFirebaseConfigured) {
        return db.collection('teams').doc(teamId).update(updates);
    }
    const teamIndex = demoData.teams.findIndex(t => t.id === teamId);
    if (teamIndex > -1) {
        const currentTeam = demoData.teams[teamIndex];
        const newTeam = { ...currentTeam };

        // Deep merge for nested objects like 'stats'
        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                if (typeof updates[key] === 'object' && !Array.isArray(updates[key]) && updates[key] !== null && currentTeam[key]) {
                    newTeam[key] = { ...currentTeam[key], ...updates[key] };
                } else {
                    newTeam[key] = updates[key];
                }
            }
        }
        demoData.teams[teamIndex] = newTeam;
    }
    return Promise.resolve();
};

export const addTeam = async (teamData: Omit<Team, 'id'>): Promise<Team> => {
    if (isFirebaseConfigured) {
        const dataToSave = {
            ...teamData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        const docRef = await db.collection('teams').add(dataToSave);
        return { id: docRef.id, ...teamData };
    }
    const newTeam: Team = { id: `t-${Date.now()}`, ...teamData };
    demoData.teams.push(newTeam);
    return Promise.resolve(newTeam);
};


// --- INVITATION API ---

export const listenToInvitationsForUser = (userId: string, callback: (invitations: Invitation[]) => void) => {
    if (isFirebaseConfigured) {
        return db.collection('invitations').where('toUserId', '==', userId).onSnapshot(snapshot => {
            callback(snapshot.docs.map(docToData));
        });
    }
    // Demo mode is not real-time, just returns current state
    callback(demoData.invitations.filter(i => i.toUserId === userId));
    return () => {}; // Return a dummy unsubscribe function
};

export const getInvitationsForUser = async (userId: string): Promise<Invitation[]> => {
     if (isFirebaseConfigured) {
        const snapshot = await db.collection('invitations').where('toUserId', '==', userId).get();
        return snapshot.docs.map(docToData);
    }
    return Promise.resolve(JSON.parse(JSON.stringify(demoData.invitations.filter(i => i.toUserId === userId))));
}

export const listenToInvitationsByTeams = (teamIds: string[], callback: (invitations: Invitation[]) => void) => {
    if (isFirebaseConfigured && teamIds.length > 0) {
        return db.collection('invitations').where('teamId', 'in', teamIds).onSnapshot(snapshot => {
            callback(snapshot.docs.map(docToData));
        });
    }
    if (teamIds.length > 0) {
        callback(demoData.invitations.filter(i => teamIds.includes(i.teamId)));
    }
    return () => {};
};

export const getInvitationsByTeams = async (teamIds: string[]): Promise<Invitation[]> => {
    if (isFirebaseConfigured && teamIds.length > 0) {
        const snapshot = await db.collection('invitations').where('teamId', 'in', teamIds).get();
        return snapshot.docs.map(docToData);
    }
     if (teamIds.length > 0) {
        return Promise.resolve(JSON.parse(JSON.stringify(demoData.invitations.filter(i => teamIds.includes(i.teamId)))));
    }
    return Promise.resolve([]);
}

export const addInvitation = async (invitationData: Omit<Invitation, 'id'>): Promise<Invitation> => {
    if (isFirebaseConfigured) {
        const dataToSave = { ...invitationData, createdAt: firebase.firestore.FieldValue.serverTimestamp() };
        const docRef = await db.collection('invitations').add(dataToSave);
        return { id: docRef.id, ...invitationData, timestamp: new Date() };
    }
    const newInvitation: Invitation = { id: `inv-${Date.now()}`, ...invitationData, timestamp: new Date() };
    demoData.invitations.push(newInvitation);
    return Promise.resolve(newInvitation);
};

export const deleteInvitation = async (invitationId: string): Promise<void> => {
    if (isFirebaseConfigured) {
        return db.collection('invitations').doc(invitationId).delete();
    }
    demoData.invitations = demoData.invitations.filter(i => i.id !== invitationId);
    return Promise.resolve();
};


// --- FORUM API ---

const aggregateReactions = async (reactionsSnapshot) => {
    const reactionsMap = new Map();
    reactionsSnapshot.docs.forEach(doc => {
        const reaction = doc.data();
        const emoji = reaction.emoji;
        const userId = doc.id;
        if (!reactionsMap.has(emoji)) {
            reactionsMap.set(emoji, []);
        }
        reactionsMap.get(emoji).push(userId);
    });
    return Array.from(reactionsMap.entries()).map(([emoji, userIds]) => ({ emoji, userIds }));
};

export const listenToPosts = (callback) => {
    if (isFirebaseConfigured) {
        return db.collection('posts').orderBy('createdAt', 'desc').onSnapshot(async (snapshot) => {
            const posts = await Promise.all(snapshot.docs.map(async (doc) => {
                const post = docToData(doc);
                const commentsSnapshot = await db.collection('posts').doc(doc.id).collection('comments').orderBy('createdAt', 'asc').get();
                const comments = await Promise.all(commentsSnapshot.docs.map(async (commentDoc) => {
                    const comment = docToData(commentDoc);
                    const commentReactionsSnapshot = await commentDoc.ref.collection('reactions').get();
                    comment.reactions = await aggregateReactions(commentReactionsSnapshot);
                    comment.timestamp = comment.createdAt; 
                    return comment;
                }));
                const postReactionsSnapshot = await doc.ref.collection('reactions').get();
                post.reactions = await aggregateReactions(postReactionsSnapshot);
                post.comments = comments;
                post.timestamp = post.createdAt;
                delete post.createdAt;
                return post;
            }));
            callback(posts);
        });
    }
    callback(demoData.posts);
    return () => {}; 
};

export const addPost = async (postData) => {
    if (isFirebaseConfigured) {
        const { content, imageUrl, tags, authorId, authorName, authorProfilePicture, isFlagged } = postData;
        const dataToSave = { content, imageUrl: imageUrl || null, tags, authorId, authorName, authorProfilePicture: authorProfilePicture || null, isFlagged: isFlagged || false, createdAt: firebase.firestore.FieldValue.serverTimestamp(), updatedAt: null, commentCount: 0, reactionCounts: {} };
        const docRef = await db.collection('posts').add(dataToSave);
        return { id: docRef.id, ...postData, timestamp: new Date() };
    }
    const newPost = { id: `post-${Date.now()}`, ...postData, timestamp: new Date() };
    demoData.posts.unshift(newPost);
    return Promise.resolve(newPost);
};

export const updatePost = async (postId, updates) => {
    if (isFirebaseConfigured) {
        return db.collection('posts').doc(postId).update({ ...updates, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    }
    const postIndex = demoData.posts.findIndex(p => p.id === postId);
    if (postIndex > -1) {
        demoData.posts[postIndex] = { ...demoData.posts[postIndex], ...updates };
    }
    return Promise.resolve();
};

export const deletePost = async (postId) => {
    if (isFirebaseConfigured) {
        return db.collection('posts').doc(postId).delete();
    }
    demoData.posts = demoData.posts.filter(p => p.id !== postId);
    return Promise.resolve();
};

export const addComment = async (postId, commentData) => {
    if (isFirebaseConfigured) {
        const postRef = db.collection('posts').doc(postId);
        const commentsRef = postRef.collection('comments');
        const dataToSave = { ...commentData, createdAt: firebase.firestore.FieldValue.serverTimestamp(), reactionCounts: {} };
        const docRef = await commentsRef.add(dataToSave);
        await postRef.update({ commentCount: firebase.firestore.FieldValue.increment(1) });
        return { id: docRef.id, ...commentData, timestamp: new Date() };
    }
    const newComment = { id: `comment-${Date.now()}`, ...commentData, timestamp: new Date(), reactions: [] };
    const postIndex = demoData.posts.findIndex(p => p.id === postId);
    if (postIndex > -1) {
        demoData.posts[postIndex].comments.push(newComment);
    }
    return Promise.resolve(newComment);
};

export const toggleReaction = async (postId, commentId, userId, emoji) => {
    if (isFirebaseConfigured) {
        const postRef = db.collection('posts').doc(postId);
        let docRef;
        let reactionsRef;
        if (commentId) {
            docRef = postRef.collection('comments').doc(commentId);
            reactionsRef = docRef.collection('reactions');
        } else {
            docRef = postRef;
            reactionsRef = docRef.collection('reactions');
        }
        const userReactionRef = reactionsRef.doc(userId);
        return db.runTransaction(async (transaction) => {
            const userReactionDoc = await transaction.get(userReactionRef);
            const docSnapshot = await transaction.get(docRef);
            const reactionCounts = docSnapshot.data().reactionCounts || {};
            if (userReactionDoc.exists) {
                const existingEmoji = userReactionDoc.data().emoji;
                reactionCounts[existingEmoji] = (reactionCounts[existingEmoji] || 1) - 1;
                if (existingEmoji === emoji) {
                    transaction.delete(userReactionRef);
                } else {
                    transaction.set(userReactionRef, { emoji, createdAt: new Date() });
                    reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
                }
            } else {
                transaction.set(userReactionRef, { emoji, createdAt: new Date() });
                reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
            }
            transaction.update(docRef, { reactionCounts });
        });
    }
    const postIndex = demoData.posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;
    const post = demoData.posts[postIndex];
    let targetObject;
    if (commentId) {
        const commentIndex = post.comments.findIndex(c => c.id === commentId);
        if (commentIndex === -1) return;
        targetObject = post.comments[commentIndex];
    } else {
        targetObject = post;
    }
    const userPreviousReaction = targetObject.reactions.find(r => r.userIds.includes(userId));
    if (userPreviousReaction) {
        userPreviousReaction.userIds = userPreviousReaction.userIds.filter(id => id !== userId);
    }
    if (!userPreviousReaction || userPreviousReaction.emoji !== emoji) {
        const reaction = targetObject.reactions.find(r => r.emoji === emoji);
        if (reaction) {
            reaction.userIds.push(userId);
        } else {
            targetObject.reactions.push({ emoji, userIds: [userId] });
        }
    }
    targetObject.reactions = targetObject.reactions.filter(r => r.userIds.length > 0);
    return Promise.resolve();
};

// --- TEAM CHAT API ---

export const listenToTeamChat = (teamId: string, callback: (messages: ChatMessage[]) => void) => {
    if (isFirebaseConfigured) {
        return db.collection('teams').doc(teamId).collection('chat').orderBy('createdAt', 'asc').onSnapshot(snapshot => {
            const messages = snapshot.docs.map(doc => {
                const data = docToData(doc);
                data.timestamp = data.createdAt;
                delete data.createdAt;
                return data;
            });
            callback(messages);
        });
    }
    if (!demoData.chats) demoData.chats = {};
    if (!demoData.chats[teamId]) demoData.chats[teamId] = [];
    callback(demoData.chats[teamId]);
    return () => {};
};

export const addChatMessage = async (teamId: string, messageData: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> => {
    if (isFirebaseConfigured) {
        const dataToSave = { ...messageData, readBy: [], createdAt: firebase.firestore.FieldValue.serverTimestamp() };
        const docRef = await db.collection('teams').doc(teamId).collection('chat').add(dataToSave);
        return { id: docRef.id, ...messageData, timestamp: new Date(), readBy: [] };
    }
    const newMessage: ChatMessage = { id: `msg-${Date.now()}`, ...messageData, timestamp: new Date(), readBy: [] };
    if (!demoData.chats) demoData.chats = {};
    if (!demoData.chats[teamId]) demoData.chats[teamId] = [];
    demoData.chats[teamId].push(newMessage);
    return Promise.resolve(newMessage);
};

export const markMessageAsRead = async (teamId, messageId, userId) => {
    if (isFirebaseConfigured) {
        const messageRef = db.collection('teams').doc(teamId).collection('chat').doc(messageId);
        return messageRef.update({
            readBy: firebase.firestore.FieldValue.arrayUnion(userId)
        });
    }
    if (demoData.chats && demoData.chats[teamId]) {
        const msgIndex = demoData.chats[teamId].findIndex(m => m.id === messageId);
        if (msgIndex > -1) {
            const message = demoData.chats[teamId][msgIndex];
            if (!message.readBy) {
                message.readBy = [];
            }
            if (!message.readBy.includes(userId)) {
                message.readBy.push(userId);
            }
        }
    }
    return Promise.resolve();
};

export const deleteChatMessage = async (teamId: string, messageId: string): Promise<void> => {
    if (isFirebaseConfigured) {
        const messageRef = db.collection('teams').doc(teamId).collection('chat').doc(messageId);
        // Soft delete: update the message to indicate it's deleted
        return messageRef.update({
            deleted: true,
            text: '', // Clear the original text
            attachment: firebase.firestore.FieldValue.delete(),
            replyTo: firebase.firestore.FieldValue.delete() // Remove the reply context
        });
    }
    // Handle demo mode
    if (demoData.chats && demoData.chats[teamId]) {
        const msgIndex = demoData.chats[teamId].findIndex(m => m.id === messageId);
        if (msgIndex > -1) {
            demoData.chats[teamId][msgIndex].deleted = true;
            demoData.chats[teamId][msgIndex].text = '';
            delete demoData.chats[teamId][msgIndex].replyTo;
            delete demoData.chats[teamId][msgIndex].attachment;
        }
    }
    return Promise.resolve();
};