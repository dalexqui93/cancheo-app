// @ts-nocheck
import type { SoccerField, User, ConfirmedBooking, OwnerApplication, Review, Announcement, Player, Team, TeamEvent, Match } from './types';

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
        console.error('Error al inicializar Firebase. Revisa tus credenciales en database.ts:', String(e));
    }
} else {
    console.warn("ATENCIÓN: Firebase no está configurado. La aplicación se ejecutará en modo de demostración con datos locales. Edita el archivo 'database.ts' con tus credenciales para habilitar la persistencia.");
}

// =============================================================================
// DATOS PARA MODO DEMO Y SEEDING
// =============================================================================

const opponentNames = ['Los Titanes', 'Atlético Barrial', 'Furia Roja FC', 'Deportivo Amigos', 'Guerreros FC', 'Leyendas Urbanas'];

const adminToSeed: Omit<User, 'id'> = {
    name: 'Admin', email: 'admin@cancheo.com', password: 'admin123', isAdmin: true, isOwner: false, favoriteFields: [], isPremium: true, notifications: [],
    notificationPreferences: { newAvailability: true, specialDiscounts: true, importantNews: true }, cancheoCoins: 1000,
};
const owner1ToSeed: Omit<User, 'id'> = {
    name: 'Propietario Templo', email: 'owner1@cancheo.com', password: 'owner123', isOwner: true, ownerStatus: 'approved', isAdmin: false, favoriteFields: [], isPremium: false, notifications: [],
    notificationPreferences: { newAvailability: true, specialDiscounts: true, importantNews: true }, cancheoCoins: 100,
};
const owner2ToSeed: Omit<User, 'id'> = {
    name: 'Propietario Gol', email: 'owner2@cancheo.com', password: 'owner123', isOwner: true, ownerStatus: 'approved', isAdmin: false, favoriteFields: [], isPremium: false, notifications: [],
    notificationPreferences: { newAvailability: true, specialDiscounts: true, importantNews: true }, cancheoCoins: 100,
};
const player1ToSeed: Omit<User, 'id'> = {
    name: 'Juan Perez', email: 'juan@test.com', password: 'password123', isOwner: false, isAdmin: false, favoriteFields: ['complex-1'], profilePicture: 'https://i.pravatar.cc/150?u=juanperez', phone: '3001234567',
    notificationPreferences: { newAvailability: true, specialDiscounts: true, importantNews: true }, isPremium: true, loyalty: { 'field-1': { progress: 3, freeTickets: 1 } }, cancheoCoins: 250,
    notifications: [{ id: Date.now(), type: 'info', title: '¡Bienvenido a Cancheo!', message: 'Gracias por registrarte. ¡Disfruta de tu bono de 100 Cancheo Coins!', timestamp: new Date() }],
};

const fieldsToSeed = (owner1Id: string, owner2Id: string): Omit<SoccerField, 'id'>[] => [
  {
    complexId: 'complex-1', ownerId: owner1Id, name: 'El Templo del Fútbol - Cancha 1', address: 'Calle 123 #45-67', city: 'Bogotá', department: 'Cundinamarca', pricePerHour: 90000, rating: 4.5,
    images: ['https://i.pinimg.com/736x/47/33/3e/47333e07ed4963aa120c821b597d0f8e.jpg', 'https://i.pinimg.com/736x/ee/5b/8d/ee5b8d1fe632960104478b7c5b883c85.jpg'],
    description: 'El mejor lugar para jugar con tus amigos. Canchas de última generación con césped sintético de alta calidad.',
    services: [ { name: 'Vestuarios', icon: '👕' }, { name: 'Cafetería', icon: '☕' }, { name: 'Parqueadero', icon: '🅿️' } ],
    reviews: [
        { id: 'r1', author: 'Juan Perez', rating: 5, comment: 'Excelente cancha, muy bien cuidada. El césped está en perfectas condiciones.', timestamp: new Date('2024-07-20T10:00:00Z') },
        { id: 'r2', author: 'Maria Rodriguez', rating: 4, comment: 'Muy buenas instalaciones, aunque a veces es difícil conseguir reserva. Recomiendo planificar con tiempo.', timestamp: new Date('2024-07-18T15:30:00Z') },
        { id: 'r10', author: 'Carlos Sánchez', rating: 5, comment: '¡De las mejores de la ciudad! La atención en la cafetería también es de primera.', timestamp: new Date('2024-07-15T20:00:00Z') },
        { id: 'r11', author: 'Laura Gómez', rating: 4, comment: 'Me encanta este lugar. Solo sugeriría mejorar un poco la iluminación para los partidos nocturnos.', timestamp: new Date('2024-07-12T21:00:00Z') }
    ],
    size: '5v5', latitude: 4.648283, longitude: -74.088951, loyaltyEnabled: true, loyaltyGoal: 7,
  },
  {
    complexId: 'complex-1', ownerId: owner1Id, name: 'El Templo del Fútbol - Cancha 2', address: 'Calle 123 #45-67', city: 'Bogotá', department: 'Cundinamarca', pricePerHour: 120000, rating: 4.8,
    images: ['https://i.pinimg.com/736x/7f/b7/3c/7fb73cf022f824a1443d5c9081cfe618.jpg', 'https://i.pinimg.com/736x/a5/7a/fa/a57afa6abeaeb64f8f2a1a0689e9a3f8.jpg'],
    description: 'El mejor lugar para jugar con tus amigos. Canchas de última generación con césped sintético de alta calidad.',
    services: [ { name: 'Vestuarios', icon: '👕' }, { name: 'Cafetería', icon: '☕' }, { name: 'Parqueadero', icon: '🅿️' } ],
    reviews: [], size: '7v7', latitude: 4.648283, longitude: -74.088951, loyaltyEnabled: true, loyaltyGoal: 7,
  },
  {
    complexId: 'complex-2', ownerId: owner2Id, name: 'Gol Center - Cancha A', address: 'Avenida 68 #90-12', city: 'Medellín', department: 'Antioquia', pricePerHour: 75000, rating: 4.5,
    images: ['https://i.pinimg.com/originals/7f/e1/99/7fe1991a0c74a7b73c4e33989e24634f.jpg', 'https://i.pinimg.com/originals/1c/c7/2b/1cc72b7a957252277d3f0a9903b418a0.jpg'],
    description: 'Canchas económicas y de buena calidad en el corazón de la ciudad. Ideal para partidos casuales.',
    services: [ { name: 'Balones', icon: '⚽' }, { name: 'Tienda', icon: '🏪' } ],
    reviews: [ { id: 'r3', author: 'Carlos Diaz', rating: 4, comment: 'Buen precio y la cancha está bien.', timestamp: new Date() } ],
    size: '5v5', latitude: 6.25184, longitude: -75.56359, loyaltyEnabled: true, loyaltyGoal: 10,
  }
];

const announcementsToSeed = (owner1Id: string) => [
    { title: '¡Torneo de Verano!', message: 'Inscripciones abiertas para nuestro torneo de verano en El Templo del Fútbol. ¡Grandes premios!', type: 'news', ownerId: owner1Id, complexName: 'El Templo del Fútbol' }
];

// --- Team & Player Mock Data (moved from SocialView) ---
const mockPlayers: Player[] = [
    { 
        id: 'u1', name: 'Carlos Pérez', profilePicture: 'https://i.pravatar.cc/150?u=u1', number: 9, position: 'Delantero', level: 'Competitivo', stats: { matchesPlayed: 15, goals: 12, assists: 4, yellowCards: 3, redCards: 0 },
        age: 28, height: 182, weight: 78, dominantFoot: 'Derecho', bio: 'Delantero rápido y letal en el área. Siempre buscando el gol.', strength: 85, speed: 92, stamina: 88, specialSkills: ['Tiro Potente', 'Regate Rápido', 'Cabeceo'],
    },
    { 
        id: 'u2', name: 'Ana García', profilePicture: 'https://i.pravatar.cc/150?u=u2', number: 4, position: 'Defensa', level: 'Competitivo', stats: { matchesPlayed: 15, goals: 1, assists: 2, yellowCards: 5, redCards: 0 },
        age: 26, height: 170, weight: 65, dominantFoot: 'Derecho', bio: 'Defensa central sólida y con buen juego aéreo.', strength: 90, speed: 75, stamina: 85, specialSkills: ['Defensa Férrea', 'Marcaje', 'Cabeceo'],
    },
    { 
        id: 'u3', name: 'Luis Fernandez', profilePicture: 'https://i.pravatar.cc/150?u=u3', number: 10, position: 'Medio', level: 'Competitivo', stats: { matchesPlayed: 15, goals: 6, assists: 9, yellowCards: 1, redCards: 0 },
        age: 30, height: 175, weight: 72, dominantFoot: 'Ambidiestro', bio: 'Mediocampista creativo con gran visión de juego.', strength: 78, speed: 82, stamina: 90, specialSkills: ['Visión de Juego', 'Pase Preciso', 'Regate Rápido'],
    },
    { 
        id: 'u4', name: 'Marta Gomez', profilePicture: 'https://i.pravatar.cc/150?u=u4', number: 1, position: 'Portero', level: 'Competitivo', stats: { matchesPlayed: 15, goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
        age: 24, height: 185, weight: 80, dominantFoot: 'Derecho', bio: 'Portera con excelentes reflejos y segura en el mano a mano.', strength: 88, speed: 80, stamina: 82, specialSkills: ['Portero Ágil', 'Liderazgo'],
    },
    { 
        id: 'u5', name: 'Juan Rodriguez', profilePicture: 'https://i.pravatar.cc/150?u=u5', number: 8, position: 'Medio', level: 'Intermedio', stats: { matchesPlayed: 13, goals: 3, assists: 5, yellowCards: 2, redCards: 0 },
        age: 22, height: 178, weight: 75, bio: 'Box-to-box midfielder.', strength: 80, speed: 85, stamina: 92, specialSkills: ['Resistencia', 'Pase Preciso'],
    },
    { 
        id: 'u6', name: 'Sofía López', profilePicture: 'https://i.pravatar.cc/150?u=u6', number: 11, position: 'Delantero', level: 'Intermedio', stats: { matchesPlayed: 10, goals: 7, assists: 2, yellowCards: 0, redCards: 0 },
        age: 25, height: 168, weight: 62, dominantFoot: 'Izquierdo', bio: 'Extremo veloz con buen uno contra uno.', strength: 70, speed: 94, stamina: 80, specialSkills: ['Velocidad', 'Regate Rápido'],
    },
    { id: 'u7', name: 'Diego Martínez', profilePicture: 'https://i.pravatar.cc/150?u=u7', number: 5, position: 'Defensa', level: 'Intermedio', stats: { matchesPlayed: 14, goals: 0, assists: 1, yellowCards: 8, redCards: 1 } },
    { id: 'u8', name: 'Leo Messi', profilePicture: 'https://i.pravatar.cc/150?u=u8', number: 30, position: 'Delantero', level: 'Competitivo', stats: { matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 }},
    { id: 'u9', name: 'CR7', profilePicture: 'https://i.pravatar.cc/150?u=u9', number: 7, position: 'Delantero', level: 'Competitivo', stats: { matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 }},
    { id: 'u10', name: 'Neymar Jr', profilePicture: 'https://i.pravatar.cc/150?u=u10', number: 10, position: 'Delantero', level: 'Competitivo', stats: { matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 }},
    { id: 'u11', name: 'Kylian Mbappe', profilePicture: 'https://i.pravatar.cc/150?u=u11', number: 7, position: 'Delantero', level: 'Competitivo', stats: { matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 }},
    { id: 'u12', name: 'Luka Modric', profilePicture: 'https://i.pravatar.cc/150?u=u12', number: 10, position: 'Medio', level: 'Competitivo', stats: { matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 }},
];

const mockSchedule: TeamEvent[] = [
    { id: 'ev1', type: 'match', date: new Date(new Date().setDate(new Date().getDate() + 3)), title: 'vs. Atlético Panas', location: 'Gol Center Envigado' },
    { id: 'ev2', type: 'training', date: new Date(new Date().setDate(new Date().getDate() + 5)), title: 'Entrenamiento Táctico', location: 'Cancha El Templo' },
    { id: 'ev3', type: 'event', date: new Date(new Date().setDate(new Date().getDate() + 10)), title: 'Asado de Equipo', location: 'Club Campestre' },
];

const mockTeams: Team[] = [
    {
        id: 't1', name: 'Los Galácticos', captainId: 'u1', players: mockPlayers.slice(0, 7),
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iIzAzM0E2MyIgc3Ryb2tlPSIjRkZGIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNNTAsMjVsNS44NzgsMTEuOTcgMTMuMjIuOTU2LTkuNjg2LDguNzYgMi4wOCwxMy4wMTRMNTAsNTMuNmwtMTEuOTEyLDcuMSAyLjUtMTMuMDE0LTkuNjg2LTguNzYgMTMuMjItLjk1NloiIGZpbGw9IiNGRkYiLz48L3N2Zz4=',
        level: 'Competitivo', stats: { wins: 1, losses: 0, draws: 1 },
        formation: '4-3-3',
        playerPositions: {},
        tacticsNotes: "Presión alta al rival. Salida rápida por las bandas. El #10 tiene libertad de movimiento.",
        schedule: mockSchedule,
        matchHistory: [
            { id: 'mh1', teamA: {id: 't1', name: 'Los Galácticos'}, teamB: {id: 'ext1', name: 'Rivales FC'}, scoreA: 3, scoreB: 3, date: new Date('2024-07-20'), status: 'jugado'},
            { id: 'mh2', teamA: {id: 't1', name: 'Los Galácticos'}, teamB: {id: 'ext2', name: 'Deportivo Amigos'}, scoreA: 5, scoreB: 2, date: new Date('2024-07-13'), status: 'jugado'},
        ],
    },
    {
        id: 't2', name: 'Atlético Panas', captainId: 'u6', players: [],
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iI0Y0NUEyMCIgc3Ryb2tlPSIjRkZGIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNNjUgNDVINzVDNTUgNjAgNDAgNjUgMzUgNDUgQzUwIDM1IDUwIDM1IDY1IDQ1WiIgZmlsbD0iI0ZGRiIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iNDIiIHI9IjUiIGZpbGw9IiNGRkYiLz48Y2lyY2xlIGN4PSI2NSIgY3k9IjQyIiByPSI1IiBmaWxsPSIjRkZGIi8+PC9zdmc+',
        level: 'Intermedio', stats: { wins: 8, losses: 5, draws: 3 },
        formation: '4-4-2', playerPositions: {}, schedule: [], 
        matchHistory: [
             { id: 'mh3', teamA: {id: 't2', name: 'Atlético Panas'}, teamB: {id: 'ext3', name: 'Real Mandil'}, scoreA: 1, scoreB: 2, date: new Date('2024-07-22'), status: 'jugado'},
             { id: 'mh4', teamA: {id: 't2', name: 'Atlético Panas'}, teamB: {id: 'ext4', name: 'Spartans FC'}, scoreA: 4, scoreB: 0, date: new Date('2024-07-15'), status: 'jugado'},
        ],
    },
    {
        id: 't3', name: 'Real Mandil', captainId: 'u-other', players: [mockPlayers[8], mockPlayers[9]],
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNNTAgMEwxMCAyMFY2MEMxMCA5MCA1MCAxMDAgNTAgMTAwUzkwIDkwIDkwIDYwVjIwWiIgZmlsbD0iIzAwMDAwMCIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNMzUgMjVMNjUgMjVNNTAgMjVMMzUgNDBINjVMNTAgMjVaIE0zNSA0MEw1MCA2MEw2NSA0MFoiIGZpbGw9IiNGRkQ3MDAiLz48L3N2Zz4=',
        level: 'Casual', stats: { wins: 3, losses: 9, draws: 2 },
        formation: '4-4-2', playerPositions: {}, schedule: [], matchHistory: [],
    },
    {
        id: 't4', name: 'Spartans FC', captainId: 'u-other', players: [mockPlayers[10], mockPlayers[11]],
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNNTAgMTBMMTAgNDBWNzBMMjAgOTBMODAgOTBMMzAgNzBMMzAgNTBMODAgNTBaIiBmaWxsPSIjQzgwODJGIiBzdHJva2U9IiNGRkYiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik01MCAxMEw5MCA0MFY3MEw4MCA5MEwyMCA5MFM3MCA3MCA3MCA1MFMxMCA1MCAxMCA3MFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+',
        level: 'Competitivo', stats: { wins: 15, losses: 1, draws: 0 },
        formation: '4-4-2', playerPositions: {}, schedule: [], matchHistory: [],
    },
     { id: 't5', name: 'Furia Roja', captainId: 'u-other', players: [], logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iI0JEMDAwMCIgc3Ryb2tlPSIjZmVkNzAwIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNNTAgMjAgQyA3MCA0MCA3MCA2MCA1MCA4MCBDIDMwIDYwIDMwIDQwIDUwIDIwIFoiIGZpbGw9IiNmZWQ3MDAiPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgdHlwZT0ic2NhbGUiIGZyb209IjEgMSIgdG89IjEuMSAxLjEiIGR1cj0iMXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBhZGRpdGl2ZT0ic3VtIiBiZWdpbj0iMHMiIGF0dHJpYnV0ZVR5cGU9IlhNTCIvPjwvcGF0aD48L3N2Zz4=', level: 'Intermedio', stats: { wins: 5, losses: 5, draws: 5 }, formation: '4-4-2', playerPositions: {}, schedule: [], matchHistory: [] },
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
    const owner1Ref = usersCollection.doc('owner-1');
    batch.set(owner1Ref, owner1ToSeed);
    const owner2Ref = usersCollection.doc('owner-2');
    batch.set(owner2Ref, owner2ToSeed);
    const adminRef = usersCollection.doc('admin-user');
    batch.set(adminRef, adminToSeed);
    const player1Ref = usersCollection.doc('player-1');
    batch.set(player1Ref, player1ToSeed);

    // Añadir canchas
    const fieldsCollection = db.collection('fields');
    fieldsToSeed('owner-1', 'owner-2').forEach(fieldData => {
        const fieldRef = fieldsCollection.doc();
        batch.set(fieldRef, {...fieldData, createdAt: firebase.firestore.FieldValue.serverTimestamp()});
    });

    // Añadir anuncios
    const announcementsCollection = db.collection('announcements');
    announcementsToSeed('owner-1').forEach(announcementData => {
        const announcementRef = announcementsCollection.doc();
        batch.set(announcementRef, {...announcementData, createdAt: firebase.firestore.FieldValue.serverTimestamp()});
    });

    try {
        await batch.commit();
        console.log("Base de datos poblada exitosamente.");
    } catch (error) {
        console.error("Error al poblar la base de datos:", String(error));
    }
};

// --- API DE LA BASE DE DATOS ---

// -- Helpers ---
const docToData = (doc) => {
    const data = doc.data();
    // Convierte Timestamps de Firestore a objetos Date de JS de forma recursiva
    const convertTimestamps = (obj) => {
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
    try {
        const snapshot = await db.collection(collectionName).get();
        return snapshot.docs.map(docToData);
    } catch (error) {
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
};

const initializeDemoData = () => {
    const owner1 = { id: 'owner-1', ...owner1ToSeed };
    const owner2 = { id: 'owner-2', ...owner2ToSeed };
    const admin = { id: 'admin-user', ...adminToSeed };
    const player1 = { id: 'player-1', ...player1ToSeed };
    demoData.users = [owner1, owner2, admin, player1];

    demoData.fields = fieldsToSeed('owner-1', 'owner-2').map((f, i) => ({ id: `field-${i}`, ...f, reviews: f.reviews.map(r => ({...r, timestamp: new Date(r.timestamp)})) }));
    
    demoData.announcements = announcementsToSeed('owner-1').map((a, i) => ({ id: `announcement-${i}`, ...a, createdAt: new Date() }));
    
    demoData.teams = mockTeams;

    // Partidos de demostración para hoy
    const nowForBooking = new Date();
    const liveStartTime = new Date(nowForBooking.getTime() - 30 * 60 * 1000); // 30 minutos atrás
    const liveHour = String(liveStartTime.getHours()).padStart(2, '0');
    const liveMinute = String(liveStartTime.getMinutes()).padStart(2, '0');

    demoData.bookings = [
        // Partido garantizado "en vivo"
        {
            id: 'booking-live',
            field: demoData.fields[1], // El Templo - Cancha 2
            time: `${liveHour}:${liveMinute}`,
            date: liveStartTime,
            userId: 'player-live',
            userName: 'Carlos Pérez',
            teamName: 'Equipo Rocket',
            rivalName: 'Los Invencibles',
            userPhone: '3110000001',
            extras: { balls: 0, vests: 1 },
            totalPrice: 130000,
            paymentMethod: 'cash',
            status: 'confirmed',
        },
        // Partido a medianoche
        {
            id: 'booking-midnight',
            field: demoData.fields[0], // El Templo - Cancha 1
            time: '00:00',
            date: new Date(),
            userId: 'player-midnight',
            userName: 'Nocturnos FC',
            teamName: 'Nocturnos FC',
            rivalName: 'Insomnes',
            userPhone: '3110000006',
            extras: { balls: 0, vests: 0 },
            totalPrice: 90000,
            paymentMethod: 'cash',
            status: 'confirmed',
        },
        // Partido a mediodía
        {
            id: 'booking-noon',
            field: demoData.fields[2], // Gol Center
            time: '12:00',
            date: new Date(),
            userId: 'player-noon',
            userName: 'Almuerzo FC',
            teamName: 'Almuerzo FC',
            rivalName: 'Siesta SC',
            userPhone: '3110000007',
            extras: { balls: 1, vests: 1 },
            totalPrice: 90000,
            paymentMethod: 'cash',
            status: 'confirmed',
        },
        // Partidos próximos para hoy
        {
            id: 'booking-upcoming-1',
            field: demoData.fields[0],
            time: '19:00',
            date: new Date(),
            userId: 'player-up1',
            userName: 'Juan Rodriguez',
            teamName: 'Los Galácticos',
            rivalName: 'Furia Roja',
            userPhone: '3110000002',
            extras: { balls: 1, vests: 0 },
            totalPrice: 95000,
            paymentMethod: 'card-1',
            status: 'confirmed',
        },
        {
            id: 'booking-upcoming-2',
            field: demoData.fields[2],
            time: '20:00',
            date: new Date(),
            userId: 'player-up2',
            userName: 'Amigos FC',
            userPhone: '3110000003',
            extras: { balls: 0, vests: 0 },
            totalPrice: 75000,
            paymentMethod: 'cash',
            status: 'confirmed',
        },
         {
            id: 'booking-upcoming-3',
            field: demoData.fields[1],
            time: '21:00',
            date: new Date(),
            userId: 'player-up3',
            userName: 'Ana García',
            teamName: 'Real Mandil',
            rivalName: 'Spartans FC',
            userPhone: '3110000004',
            extras: { balls: 1, vests: 1 },
            totalPrice: 135000,
            paymentMethod: 'card-2',
            status: 'confirmed',
        },
        // Partido que ya pasó hoy
        {
            id: 'booking-past-today',
            field: demoData.fields[0],
            time: '10:00',
            date: new Date(),
            userId: 'player-past',
            userName: 'Leyendas Urbanas',
            userPhone: '3110000005',
            extras: { balls: 0, vests: 0 },
            totalPrice: 90000,
            paymentMethod: 'cash',
            status: 'confirmed',
        }
    ];

    demoData.ownerApplications = [{
        id: 'app-1',
        userId: 'user-pending',
        userName: 'Pedro Pendiente',
        userEmail: 'pedro@test.com',
        complexName: 'Canchas El Futuro',
        address: 'Carrera 5 #5-5',
        phone: '3109876543',
        rutFileName: 'rut_pedro.pdf',
        photoFileNames: ['foto1.jpg', 'foto2.jpg'],
        status: 'pending',
    }];
};

if (!isFirebaseConfigured) {
    initializeDemoData();
}

// --- FUNCIONES DE LA API ---

export const getFields = async () => {
    if (isFirebaseConfigured) return getCollection('fields');
    return Promise.resolve(JSON.parse(JSON.stringify(demoData.fields)));
};

export const getUsers = async () => {
    if (isFirebaseConfigured) return getCollection('users');
    return Promise.resolve(JSON.parse(JSON.stringify(demoData.users)));
};

export const getTeams = async (): Promise<Team[]> => {
    // In a real app with Firebase, this would be: return getCollection('teams');
    return Promise.resolve(JSON.parse(JSON.stringify(demoData.teams)));
};

export const getAllBookings = async () => {
    if (isFirebaseConfigured) {
        const bookings = await getCollection('bookings');
        const fields = await getCollection('fields');
        const fieldMap = new Map(fields.map(f => [f.id, f]));
        return bookings.map(b => ({ ...b, field: fieldMap.get(b.fieldId) || b.field }));
    }
    // Parse and stringify to simulate a fresh data fetch and handle Date objects correctly
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
        // Maneja la notación de punto para campos anidados en modo demo
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
    // Asegura que los detalles del partido existan, ya sea del usuario o generados.
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