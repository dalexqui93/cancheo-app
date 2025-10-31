// @ts-nocheck
/**
 * =============================================================================
 *  Esquema de la Base de Datos para la Aplicación Cancheo
 * =============================================================================
 * 
 * Este archivo define la estructura de una base de datos relacional (como PostgreSQL)
 * para almacenar todos los datos de la aplicación. Cada interfaz representa una tabla
 * y sus propiedades representan columnas.
 *
 * --- Convenciones ---
 * - PK: Primary Key (Clave Primaria)
 * - FK: Foreign Key (Clave Foránea)
 * - `created_at`, `updated_at`: Timestamps para seguimiento de registros.
 * - JSONB: Tipo de dato flexible para almacenar objetos o arrays JSON.
 * --- Mapeo a Firestore ---
 * - Cada tabla se convierte en una Colección.
 * - Cada fila es un Documento dentro de una colección.
 * - Las claves foráneas (FK) se almacenan como IDs de documento (strings).
 * - Las tablas de unión se gestionan a menudo mediante arrays de IDs en los documentos.
 */

// =============================================================================
// 1. AUTENTICACIÓN Y USUARIOS
// =============================================================================

/**
 * Tabla `users` -> Colección `users`
 * Almacena la información principal de cada usuario, incluyendo su rol.
 */
interface UserTable {
  id: string; // PK, UUID -> ID del Documento
  name: string;
  email: string; // UNIQUE
  phone: string; // UNIQUE
  password_hash: string; // En Firebase, esto se gestiona con Firebase Authentication
  profile_picture_url: string | null;
  role: 'player' | 'owner' | 'admin';
  is_premium: boolean;
  // Timestamps son manejados automáticamente por Firestore
}

/**
 * Tabla `owners_details` -> Se integra en el documento de `users`
 * Información específica para usuarios con rol 'owner'.
 */
interface OwnerDetailsTable {
  user_id: string; // El propio ID del documento del usuario
  owner_status: 'pending' | 'approved' | 'rejected' | 'needs_correction';
  application_id: string; // Se guarda la referencia al ID de la solicitud
}

/**
 * Tabla `owner_applications` -> Colección `owner_applications`
 * Almacena las solicitudes para convertirse en propietario.
 */
interface OwnerApplicationTable {
  id: string; // PK, UUID -> ID del Documento
  user_id: string; // FK -> Referencia al ID del documento en 'users'
  complex_name: string;
  address: string;
  // Las URLs se almacenan directamente, Firebase Storage es una opción para los archivos.
  rut_file_url: string; 
  photo_file_urls: string[]; 
  status: 'pending' | 'approved' | 'rejected' | 'needs_correction';
  rejection_reason: string | null;
}


// =============================================================================
// 2. COMPLEJOS Y CANCHAS
// =============================================================================

/**
 * Tabla `complexes` y `soccer_fields` -> Colección `fields`
 * En Firestore, podemos desnormalizar y combinar esto. Cada cancha será un documento
 * en la colección `fields`, y compartirá un `complexId` para agruparlas.
 */
interface SoccerFieldDocument {
  id: string; // PK -> ID del Documento
  complex_id: string; // Para agrupar canchas del mismo complejo
  owner_id: string; // FK -> ID del propietario en 'users'
  name: string; // Nombre completo, ej: "El Templo - Cancha 1"
  address: string;
  city: string;
  description: string;
  images_urls: string[];
  latitude: number;
  longitude: number;
  size: '5v5' | '7v7' | '11v11';
  price_per_hour: number;
  loyalty_enabled: boolean;
  loyalty_goal: number;
  available_slots: object; // Objeto (Map en Firestore)
  services: object[]; // Array de objetos, ej: [{ name: "Vestuarios", icon: "👕" }]
}

// Las tablas `services` y `complex_services` se simplifican. Los servicios
// disponibles se almacenan como un array de objetos dentro de cada documento `field`.


// =============================================================================
// 3. INTERACCIONES DEL USUARIO (RESERVAS, FAVORITOS, ETC.)
// =============================================================================

/**
 * Tabla `bookings` -> Colección `bookings`
 * Almacena cada reserva realizada por un usuario.
 */
interface BookingTable {
  id: string; // PK -> ID del Documento
  user_id: string; // FK -> ID del usuario
  field_id: string; // FK -> ID de la cancha
  booking_date: Date; // Tipo Timestamp en Firestore
  total_price: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  payment_method: string;
  extras: object;
}

/**
 * Tabla `reviews` -> Se almacena como un array en el documento `field`
 * Almacena las opiniones y calificaciones. Esto es un ejemplo de desnormalización
 * para facilitar la lectura de reseñas al cargar una cancha.
 */
interface ReviewTable {
  id: string; // ID único para la reseña
  user_id: string;
  author_name: string; // Se guarda para no tener que buscar el usuario
  rating: number;
  comment: string | null;
  created_at: Date;
}

/**
 * Tabla `user_favorite_complexes` -> Se almacena como un array `favoriteFields` en el documento `user`
 * Almacena los complejos que un usuario ha marcado como favoritos.
 */
interface UserFavoriteComplexTable {
  // No es una colección separada. Es un campo `favoriteFields: string[]` en `users`.
}

/**
 * Tabla `user_loyalty_progress` -> Se almacena como un objeto (map) `loyalty` en el documento `user`
 * Rastrea el progreso de fidelidad de un usuario.
 */
interface UserLoyaltyProgressTable {
  // No es una colección separada. Es un campo `loyalty: { [complexId: string]: { progress: number, freeTickets: number } }` en `users`.
}

/**
 * Tabla `user_payment_methods` -> Se almacena como un array `paymentMethods` en el documento `user`
 * Almacena de forma segura los métodos de pago de un usuario.
 */
interface UserPaymentMethodTable {
    // No es una colección separada. Es un campo `paymentMethods: object[]` en `users`.
}

// =============================================================================
// 4. COMUNIDAD Y SOCIAL
// =============================================================================

/**
 * Tabla `player_profiles` -> Se integra en el documento de `users`
 * Extiende la tabla `users` con datos específicos del perfil de jugador.
 */
interface PlayerProfileTable {
    // Es un campo `playerProfile: object` en el documento de `users`.
}

/**
 * Tabla `teams` -> Colección `teams`
 * Almacena información sobre los equipos creados por los usuarios.
 */
interface TeamTable {
    id: string; // PK -> ID del Documento
    name: string;
    captain_id: string; // FK -> ID del usuario capitán
    logo_url: string | null;
    level: 'Casual' | 'Intermedio' | 'Competitivo';
    stats: object;
    formation: string;
    player_positions: object;
    tactics_notes: string | null;
    player_ids: string[]; // En lugar de una tabla de unión, un array de IDs de jugadores
}

/**
 * Tabla `forum_posts` -> Colección `forum_posts`
 */
interface ForumPostTable {
  id: string; // PK -> ID del Documento
  author_id: string; // FK
  content: string;
  image_url: string | null;
  tags: string[]; // En lugar de tabla de unión
  created_at: Date;
}

/**
 * Tabla `forum_comments` -> Se almacena como una subcolección `comments` en cada `forum_post`
 */
interface ForumCommentTable {
  id: string; // PK
  author_id: string; // FK
  content: string;
  created_at: Date;
}

/**
 * Tabla `reactions` -> Se almacena como un array de objetos en el documento de `post` o `comment`
 */
interface ReactionTable {
    // Campo `reactions: { emoji: string, userIds: string[] }[]` en el documento correspondiente.
}
import type { SoccerField, User, BookingDetails, ConfirmedBooking, OwnerApplication, Review, Announcement } from './types';

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
        // FIX: Consolidated console.error arguments into a single string.
        console.error(`Error al inicializar Firebase. Revisa tus credenciales en firebase.ts: ${String(e)}`);
    }
} else {
    console.warn("ATENCIÓN: Firebase no está configurado. La aplicación se ejecutará en modo de demostración con datos locales. Edita el archivo 'firebase.ts' con tus credenciales para habilitar la persistencia.");
}

// --- DATOS PARA SEMBRAR LA BASE DE DATOS (SEEDING) ---
const adminToSeed: Omit<User, 'id'> = {
    name: 'Admin', email: 'admin@cancheo.com', password: 'admin123', isAdmin: true, isOwner: false, favoriteFields: [], isPremium: true, notifications: [],
    notificationPreferences: { newAvailability: true, specialDiscounts: true, importantNews: true },
};

const owner1ToSeed: Omit<User, 'id'> = {
    name: 'Propietario Templo', email: 'owner1@cancheo.com', password: 'owner123', isOwner: true, ownerStatus: 'approved', isAdmin: false, favoriteFields: [], isPremium: false, notifications: [],
    notificationPreferences: { newAvailability: true, specialDiscounts: true, importantNews: true },
};

const owner2ToSeed: Omit<User, 'id'> = {
    name: 'Propietario Gol', email: 'owner2@cancheo.com', password: 'owner123', isOwner: true, ownerStatus: 'approved', isAdmin: false, favoriteFields: [], isPremium: false, notifications: [],
    notificationPreferences: { newAvailability: true, specialDiscounts: true, importantNews: true },
};

const fieldsToSeed: Omit<SoccerField, 'id'>[] = [
  {
    complexId: 'complex-1', ownerId: 'owner-1', name: 'El Templo del Fútbol - Cancha 1', address: 'Calle 123 #45-67', city: 'Bogotá', department: 'Cundinamarca', pricePerHour: 90000, rating: 4.8,
    images: ['https://i.pinimg.com/736x/47/33/3e/47333e07ed4963aa120c821b597d0f8e.jpg', 'https://i.pinimg.com/736x/ee/5b/8d/ee5b8d1fe632960104478b7c5b883c85.jpg'],
    description: 'El mejor lugar para jugar con tus amigos. Canchas de última generación con césped sintético de alta calidad.',
    services: [ { name: 'Vestuarios', icon: '👕' }, { name: 'Cafetería', icon: '☕' }, { name: 'Parqueadero', icon: '🅿️' } ],
    reviews: [ { id: 'r1', author: 'Juan Perez', rating: 5, comment: 'Excelente cancha, muy bien cuidada.', timestamp: new Date() } ],
    size: '5v5', latitude: 4.648283, longitude: -74.088951, loyaltyEnabled: true, loyaltyGoal: 7,
  },
  {
    complexId: 'complex-1', ownerId: 'owner-1', name: 'El Templo del Fútbol - Cancha 2', address: 'Calle 123 #45-67', city: 'Bogotá', department: 'Cundinamarca', pricePerHour: 120000, rating: 4.8,
    images: ['https://i.pinimg.com/736x/7f/b7/3c/7fb73cf022f824a1443d5c9081cfe618.jpg', 'https://i.pinimg.com/736x/a5/7a/fa/a57afa6abeaeb64f8f2a1a0689e9a3f8.jpg'],
    description: 'El mejor lugar para jugar con tus amigos. Canchas de última generación con césped sintético de alta calidad.',
    services: [ { name: 'Vestuarios', icon: '👕' }, { name: 'Cafetería', icon: '☕' }, { name: 'Parqueadero', icon: '🅿️' } ],
    reviews: [], size: '7v7', latitude: 4.648283, longitude: -74.088951, loyaltyEnabled: true, loyaltyGoal: 7,
  },
  {
    complexId: 'complex-2', ownerId: 'owner-2', name: 'Gol Center - Cancha A', address: 'Avenida 68 #90-12', city: 'Medellín', department: 'Antioquia', pricePerHour: 75000, rating: 4.5,
    images: ['https://i.pinimg.com/originals/7f/e1/99/7fe1991a0c74a7b73c4e33989e24634f.jpg', 'https://i.pinimg.com/originals/1c/c7/2b/1cc72b7a957252277d3f0a9903b418a0.jpg'],
    description: 'Canchas económicas y de buena calidad en el corazón de la ciudad. Ideal para partidos casuales.',
    services: [ { name: 'Balones', icon: '⚽' }, { name: 'Tienda', icon: '🏪' } ],
    reviews: [ { id: 'r3', author: 'Carlos Diaz', rating: 4, comment: 'Buen precio y la cancha está bien.', timestamp: new Date() } ],
    size: '5v5', latitude: 6.25184, longitude: -75.56359, loyaltyEnabled: true, loyaltyGoal: 10,
  }
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

    const adminRef = usersCollection.doc(); // Nuevo documento para el admin
    batch.set(adminRef, adminToSeed);

    // Añadir canchas
    const fieldsCollection = db.collection('fields');
    fieldsToSeed.forEach(fieldData => {
        const fieldRef = fieldsCollection.doc();
        batch.set(fieldRef, fieldData);
    });

    try {
        await batch.commit();
        console.log("Base de datos poblada exitosamente.");
    } catch (error) {
        // FIX: Consolidated console.error arguments into a single string.
        console.error(`Error poblando la base de datos: ${String(error)}`);
    }
};


// Convierte un documento de Firestore a un objeto de la app, manejando Timestamps
const fromFirestore = <T extends {}>(doc: any): T & { id: string } => {
    const data = doc.data();
    for (const key in data) {
        if (data[key] instanceof firebase.firestore.Timestamp) {
            data[key] = data[key].toDate();
        }
    }
    return { ...data, id: doc.id } as T & { id: string };
};

// --- API DE DATOS ---

export const checkIfUserExists = async (email: string): Promise<boolean> => {
    if (!db) {
        return Promise.resolve(false);
    }
    const snapshot = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
    return !snapshot.empty;
};

export const getFields = async (): Promise<SoccerField[]> => {
    if (!db) return Promise.resolve([]);
    const snapshot = await db.collection('fields').get();
    return snapshot.docs.map(fromFirestore<SoccerField>);
};

export const getUsers = async (): Promise<User[]> => {
    if (!db) return Promise.resolve([]);
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(fromFirestore<User>);
};

export const getOwnerApplications = async (): Promise<OwnerApplication[]> => {
    if (!db) return Promise.resolve([]);
    const snapshot = await db.collection('ownerApplications').get();
    return snapshot.docs.map(fromFirestore<OwnerApplication>);
};

export const getBookings = async (userId: string): Promise<ConfirmedBooking[]> => {
    if (!db) return Promise.resolve([]);
    const snapshot = await db.collection('bookings').where('userId', '==', userId).orderBy('date', 'desc').get();
    return snapshot.docs.map(fromFirestore<ConfirmedBooking>);
}

export const getAllBookings = async (): Promise<ConfirmedBooking[]> => {
    if (!db) return Promise.resolve([]);
    const snapshot = await db.collection('bookings').orderBy('date', 'desc').get();
    return snapshot.docs.map(fromFirestore<ConfirmedBooking>);
}

export const getAnnouncements = async (): Promise<Announcement[]> => {
    if (!db) return Promise.resolve([]);
    const snapshot = await db.collection('announcements').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(fromFirestore<Announcement>);
};


export const addUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    if (!db) {
        console.error("Firebase no está configurado. No se puede agregar usuario.");
        return Promise.reject(new Error("Firebase not configured"));
    }
    const userExists = await checkIfUserExists(userData.email);
    if (userExists) {
        throw new Error('DUPLICATE_EMAIL');
    }
    const docRef = await db.collection('users').add(userData);
    const newUser = { ...userData, id: docRef.id } as User;
    return newUser;
}

export const addOwnerApplication = async (appData: Omit<OwnerApplication, 'id'>): Promise<OwnerApplication> => {
    if (!db) {
        console.error("Firebase no está configurado. No se puede agregar la solicitud.");
        return Promise.reject(new Error("Firebase not configured"));
    }
    const docRef = await db.collection('ownerApplications').add(appData);
    return { ...appData, id: docRef.id };
}

export const addBooking = async (bookingData: Omit<ConfirmedBooking, 'id'>): Promise<ConfirmedBooking> => {
    if (!db) {
        console.error("Firebase no está configurado. No se puede agregar la reserva.");
        return Promise.reject(new Error("Firebase not configured"));
    }
    // Firebase maneja objetos Date, pero para ser explícitos y asegurar la consistencia,
    // convertimos la fecha a un Timestamp de Firestore antes de guardarla.
    const dataToSave = Object.assign({}, bookingData, {
        date: firebase.firestore.Timestamp.fromDate(bookingData.date),
    });

    // Eliminamos las propiedades `undefined` que podrían causar problemas.
    Object.keys(dataToSave).forEach(key => {
        if ((dataToSave as any)[key] === undefined) {
            delete (dataToSave as any)[key];
        }
    });

    const docRef = await db.collection('bookings').add(dataToSave);
    
    // Devolvemos el bookingData original (con el objeto Date de JS) y el nuevo ID
    // para mantener la consistencia en el estado de la aplicación.
    return { ...bookingData, id: docRef.id };
};

export const updateBooking = async (bookingId: string, data: Partial<ConfirmedBooking>): Promise<void> => {
    if (!db) return Promise.resolve();
    await db.collection('bookings').doc(bookingId).update(data);
};

export const updateUser = async (userId: string, data: Partial<User>): Promise<void> => {
    if (!db) return Promise.resolve();
    await db.collection('users').doc(userId).update(data);
};

export const removeUserField = async (userId: string, field: keyof User): Promise<void> => {
    if (!db) return Promise.resolve();
    await db.collection('users').doc(userId).update({
        [field]: firebase.firestore.FieldValue.delete()
    });
};

export const addReviewToField = async (fieldId: string, review: Review): Promise<void> => {
    if (!db) return Promise.resolve();
    const fieldRef = db.collection('fields').doc(fieldId);
    
    await db.runTransaction(async (transaction: any) => {
        const fieldDoc = await transaction.get(fieldRef);
        if (!fieldDoc.exists) {
            throw "El documento no existe!";
        }
        
        const oldData = fieldDoc.data() as SoccerField;
        const newReviews = [review, ...oldData.reviews];
        const newTotalReviews = newReviews.length;
        const newAverageRating = ((oldData.rating * oldData.reviews.length) + review.rating) / newTotalReviews;

        transaction.update(fieldRef, { 
            reviews: newReviews,
            rating: parseFloat(newAverageRating.toFixed(1))
        });
    });
};

export const addField = async (fieldData: Omit<SoccerField, 'id'>): Promise<SoccerField> => {
    if (!db) return Promise.reject(new Error("Firebase not configured"));
    const docRef = await db.collection('fields').add(fieldData);
    return { ...fieldData, id: docRef.id };
};

export const updateField = async (fieldId: string, data: Partial<SoccerField>): Promise<void> => {
    if (!db) return Promise.resolve();
    await db.collection('fields').doc(fieldId).update(data);
};

export const deleteField = async (fieldId: string): Promise<void> => {
    if (!db) return Promise.resolve();
    await db.collection('fields').doc(fieldId).delete();
};

export const addAnnouncement = async (announcementData: Omit<Announcement, 'id'>): Promise<Announcement> => {
    if (!db) return Promise.reject(new Error("Firebase not configured"));
    const dataToSave = {
        ...announcementData,
        createdAt: firebase.firestore.Timestamp.fromDate(announcementData.createdAt),
    };
    const docRef = await db.collection('announcements').add(dataToSave);
    return { ...announcementData, id: docRef.id };
};

export const deleteAnnouncement = async (announcementId: string): Promise<void> => {
    if (!db) return Promise.resolve();
    await db.collection('announcements').doc(announcementId).delete();
};
