// @ts-nocheck
import type { SoccerField, User, ConfirmedBooking, OwnerApplication, Review, Announcement } from './types';

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
};

const initializeDemoData = () => {
    const owner1 = { id: 'owner-1', ...owner1ToSeed };
    const owner2 = { id: 'owner-2', ...owner2ToSeed };
    const admin = { id: 'admin-user', ...adminToSeed };
    const player1 = { id: 'player-1', ...player1ToSeed };
    demoData.users = [owner1, owner2, admin, player1];

    demoData.fields = fieldsToSeed('owner-1', 'owner-2').map((f, i) => ({ id: `field-${i}`, ...f, reviews: f.reviews.map(r => ({...r, timestamp: new Date(r.timestamp)})) }));
    
    demoData.announcements = announcementsToSeed('owner-1').map((a, i) => ({ id: `announcement-${i}`, ...a, createdAt: new Date() }));
    
    demoData.bookings = [{
        id: 'booking-1',
        field: demoData.fields[0],
        time: '19:00',
        date: new Date(),
        userId: 'player-1',
        userName: player1.name,
        userPhone: player1.phone,
        extras: { balls: 1, vests: 0 },
        totalPrice: 95000,
        paymentMethod: 'pm-1',
        status: 'confirmed',
    }];
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

export const getAllBookings = async () => {
    if (isFirebaseConfigured) {
        const bookings = await getCollection('bookings');
        const fields = await getCollection('fields');
        const fieldMap = new Map(fields.map(f => [f.id, f]));
        return bookings.map(b => ({ ...b, field: fieldMap.get(b.fieldId) || b.field }));
    }
    return Promise.resolve(JSON.parse(JSON.stringify(demoData.bookings)));
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
    const dataToSave = { ...bookingData, fieldId: bookingData.field.id };
    delete dataToSave.field;

    if (isFirebaseConfigured) {
        const docRef = await db.collection('bookings').add(dataToSave);
        return { id: docRef.id, ...bookingData };
    }
    const newBooking = { id: `booking-${Date.now()}`, ...bookingData };
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
