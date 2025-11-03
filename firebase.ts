
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
 *