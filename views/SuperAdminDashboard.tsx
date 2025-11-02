import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { SoccerField, User, OwnerApplication, Notification, OwnerStatus, Player } from '../types';
import { DashboardIcon } from '../components/icons/DashboardIcon';
import { PitchIcon } from '../components/icons/PitchIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { IdentificationIcon } from '../components/icons/IdentificationIcon';
import { LogoutIcon } from '../components/icons/LogoutIcon';
import { XIcon } from '../components/icons/XIcon';
import StarRating from '../components/StarRating';
import { MailIcon } from '../components/icons/MailIcon';
import { PhoneIcon } from '../components/icons/PhoneIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import { CreditCardIcon } from '../components/icons/CreditCardIcon';
import { CheckBadgeIcon } from '../components/icons/CheckBadgeIcon';
import { SoccerBallIcon } from '../components/icons/SoccerBallIcon';
import { CogIcon } from '../components/icons/CogIcon';
import * as db from '../firebase';
import { EyeIcon } from '../components/icons/EyeIcon';
// FIX: Import EyeOffIcon to toggle password visibility
import { EyeOffIcon } from '../components/icons/EyeOffIcon';
import { LockIcon } from '../components/icons/LockIcon';

interface SuperAdminDashboardProps {
    currentUser: User | null;
    allUsers: User[];
    setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
    fields: SoccerField[];
    setFields: React.Dispatch<React.SetStateAction<SoccerField[]>>;
    ownerApplications: OwnerApplication[];
    setOwnerApplications: React.Dispatch<React.SetStateAction<OwnerApplication[]>>;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
    onLogout: () => void;
}

type AdminView = 'dashboard' | 'users' | 'fields' | 'verifications' | 'settings';

const AdminSettingsView: React.FC<{
    currentUser: User;
    setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
    onLogout: () => void;
}> = ({ currentUser, setAllUsers, addNotification, onLogout }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '', role: 'player' });
    const [showNewUserPass, setShowNewUserPass] = useState(false);
    const [createUserError, setCreateUserError] = useState('');
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        if (password.length < 8) {
            setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setPasswordError('Las contraseñas no coinciden.');
            return;
        }
        try {
            await db.updateUser(currentUser.id, { password });
            
            // This is the key change to fix the re-login bug
            setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, password: password } : u));
            
            addNotification({ type: 'success', title: 'Contraseña Actualizada', message: 'Tu contraseña ha sido cambiada. Por favor, inicia sesión de nuevo.' });
            onLogout();
        } catch (error) {
            setPasswordError('No se pudo actualizar la contraseña. Inténtalo de nuevo.');
            // FIX: Cast unknown error to string for console.error
// FIX: Pass error object as a separate argument to console.error instead of using string concatenation.
            console.error('Error al actualizar la contraseña:', error);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateUserError('');
        if (!newUser.name || !newUser.email || !newUser.password) {
            setCreateUserError('Nombre, email y contraseña son obligatorios.');
            return;
        }
        setIsCreatingUser(true);
        try {
            const userData: Omit<User, 'id'> = {
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                password: newUser.password,
                isOwner: newUser.role === 'owner',
                isAdmin: newUser.role === 'admin',
                favoriteFields: [],
                isPremium: false,
                notifications: [],
                notificationPreferences: { newAvailability: true, specialDiscounts: true, importantNews: true },
                loyalty: {},
                paymentMethods: [],
                ...(newUser.role === 'owner' && { ownerStatus: 'approved' }),
            };
            const createdUser = await db.addUser(userData);
            setAllUsers(prev => [...prev, createdUser]);
            addNotification({ type: 'success', title: 'Usuario Creado', message: `La cuenta para ${createdUser.name} ha sido creada.` });
            setNewUser({ name: '', email: '', phone: '', password: '', role: 'player' });
        } catch (error) {
            if (error instanceof Error && error.message === 'DUPLICATE_EMAIL') {
                setCreateUserError('Ya existe una cuenta con este correo electrónico.');
            } else {
                setCreateUserError('No se pudo crear el usuario. Inténtalo de nuevo.');
            }
            // FIX: Cast unknown error to string for console.error
// FIX: Pass error object as a separate argument to console.error instead of using string concatenation.
            console.error('Error al crear usuario:', error);
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    const inputClasses = "w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-1 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]";

    return (
        <div className="space-y-6">
            <form onSubmit={handlePasswordChange} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Cambiar mi Contraseña</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <label className="text-sm font-medium">Nueva Contraseña</label>
                        <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className={inputClasses} />
                        {/* FIX: Toggle between EyeIcon and EyeOffIcon for password visibility */}
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-7 h-5 w-5 text-gray-400">{showPass ? <EyeOffIcon/> : <EyeIcon/>}</button>
                    </div>
                    <div className="relative">
                        <label className="text-sm font-medium">Confirmar Contraseña</label>
                        <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClasses} />
                        {/* FIX: Toggle between EyeIcon and EyeOffIcon for password visibility */}
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-7 h-5 w-5 text-gray-400">{showConfirm ? <EyeOffIcon/> : <EyeIcon/>}</button>
                    </div>
                </div>
                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                <div className="flex justify-end">
                    <button type="submit" className="py-2 px-4 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm text-sm">Guardar Contraseña</button>
                </div>
            </form>
            
            <form onSubmit={handleCreateUser} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Crear Nuevo Usuario</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="name" value={newUser.name} onChange={handleNewUserChange} placeholder="Nombre Completo" className={inputClasses} />
                    <input type="email" name="email" value={newUser.email} onChange={handleNewUserChange} placeholder="Correo Electrónico" className={inputClasses} />
                    <input type="tel" name="phone" value={newUser.phone} onChange={handleNewUserChange} placeholder="Teléfono" className={inputClasses} />
                    <div className="relative">
                        <input type={showNewUserPass ? 'text' : 'password'} name="password" value={newUser.password} onChange={handleNewUserChange} placeholder="Contraseña" className={inputClasses} />
                        {/* FIX: Toggle between EyeIcon and EyeOffIcon for password visibility */}
                        <button type="button" onClick={() => setShowNewUserPass(!showNewUserPass)} className="absolute right-3 top-2 h-5 w-5 text-gray-400">{showNewUserPass ? <EyeOffIcon/> : <EyeIcon/>}</button>
                    </div>
                    <select name="role" value={newUser.role} onChange={handleNewUserChange} className={inputClasses}>
                        <option value="player">Jugador</option>
                        <option value="owner">Propietario</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
                {createUserError && <p className="text-red-500 text-sm">{createUserError}</p>}
                <div className="flex justify-end">
                    <button type="submit" disabled={isCreatingUser} className="py-2 px-4 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm text-sm disabled:bg-gray-400">
                        {isCreatingUser ? 'Creando...' : 'Crear Usuario'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 flex items-center gap-4">
        <div className="w-10 h-10 bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)]/50 rounded-lg flex items-center justify-center text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);

const VerificationRequestsView: React.FC<SuperAdminDashboardProps> = ({ ownerApplications, setOwnerApplications, allUsers, setAllUsers, addNotification, setFields }) => {
    const [selectedApp, setSelectedApp] = useState<OwnerApplication | null>(null);

    const handleUpdateStatus = (appId: string, userId: string, newStatus: OwnerStatus, rejectionReason?: string) => {
        setOwnerApplications(prev => prev.map(app => 
            app.id === appId ? { ...app, status: newStatus, rejectionReason } : app
        ));
        setAllUsers(prev => prev.map(user => 
            user.id === userId ? { ...user, ownerStatus: newStatus, isOwner: newStatus === 'approved' } : user
        ));

        if (newStatus === 'approved') {
            const app = ownerApplications.find(a => a.id === appId);
            if (app) {
                const newComplexId = `complex-${Date.now()}`;
                const newField: SoccerField = {
                    id: `field-${Date.now()}`,
                    complexId: newComplexId,
                    ownerId: app.userId,
                    name: app.complexName,
                    address: app.address,
                    city: 'Bogotá', // Placeholder city
                    pricePerHour: 80000, // Placeholder price
                    rating: 0,
                    images: ['https://picsum.photos/seed/new-field/800/600'], // Placeholder image
                    description: `Bienvenido a ${app.complexName}. Complejo recién registrado.`,
                    services: [],
                    reviews: [],
                    size: '5v5',
                    latitude: 4.6097, // Placeholder coords
                    longitude: -74.0817,
                    loyaltyEnabled: false,
                    loyaltyGoal: 7,
                };
                setFields(prev => [...prev, newField]);
            }
            addNotification({ type: 'success', title: 'Solicitud Aprobada', message: `El propietario ${app?.userName} ha sido aprobado.` });
        } else {
            addNotification({ type: 'info', title: 'Solicitud Actualizada', message: `El estado de la solicitud ha sido cambiado a "${newStatus}".` });
        }
        setSelectedApp(null);
    };

    const pendingApplications = ownerApplications.filter(a => a.status === 'pending');

    return (
        <div className="space-y-4">
            {pendingApplications.length > 0 ? (
                pendingApplications.map(app => (
                    <button key={app.id} onClick={() => setSelectedApp(app)} className="w-full text-left bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <div>
                            <p className="font-bold">{app.complexName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{app.userName} - {app.userEmail}</p>
                        </div>
                        <span className="font-bold text-yellow-500">PENDIENTE</span>
                    </button>
                ))
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay solicitudes pendientes.</p>
            )}

            {selectedApp && (
                <VerificationDetailModal 
                    app={selectedApp} 
                    onClose={() => setSelectedApp(null)}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}
        </div>
    );
};

const VerificationDetailModal: React.FC<{ app: OwnerApplication, onClose: () => void, onUpdateStatus: (appId: string, userId: string, newStatus: OwnerStatus, reason?: string) => void }> = ({ app, onClose, onUpdateStatus }) => {
    const [rejectionReason, setRejectionReason] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg m-4 flex flex-col" style={{maxHeight: '90vh'}} onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Revisar Solicitud</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-5 overflow-y-auto space-y-4 text-sm">
                    <p><strong>Propietario:</strong> {app.userName}</p>
                    <p><strong>Email:</strong> {app.userEmail}</p>
                    <p><strong>Teléfono:</strong> {app.phone}</p>
                    <p><strong>Nombre del Complejo:</strong> {app.complexName}</p>
                    <p><strong>Dirección:</strong> {app.address}</p>
                    <p><strong>RUT:</strong> <span className="text-blue-500 hover:underline cursor-pointer">{app.rutFileName}</span></p>
                    <div>
                        <strong>Fotos:</strong>
                        <ul className="list-disc list-inside ml-4">
                            {app.photoFileNames.map(name => <li key={name} className="text-blue-500 hover:underline cursor-pointer">{name}</li>)}
                        </ul>
                    </div>
                    {app.status !== 'pending' && (
                        <div>
                            <label className="font-semibold block mb-1">Razón de Rechazo/Corrección</label>
                            <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" rows={2}/>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end gap-3 flex-wrap">
                    <button onClick={() => onUpdateStatus(app.id, app.userId, 'rejected', rejectionReason)} className="py-2 px-4 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 text-sm">Rechazar</button>
                    <button onClick={() => onUpdateStatus(app.id, app.userId, 'needs_correction', rejectionReason)} className="py-2 px-4 rounded-lg font-semibold bg-yellow-500 text-white hover:bg-yellow-600 text-sm">Pedir Corrección</button>
                    <button onClick={() => onUpdateStatus(app.id, app.userId, 'approved')} className="py-2 px-4 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 text-sm">Aprobar</button>
                </div>
            </div>
        </div>
    );
};

const FieldDetailModal: React.FC<{
    field: SoccerField;
    owner: User | undefined;
    onClose: () => void;
}> = ({ field, owner, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl m-4 flex flex-col" style={{maxHeight: '90vh'}} onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold">{field.name}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-5 overflow-y-auto space-y-6 text-sm">
                    {/* Owner Info */}
                    <div className="p-4 bg-slate-50 dark:bg-gray-700/50 rounded-lg">
                        <h4 className="text-lg font-bold mb-3">Propietario</h4>
                        {owner ? (
                            <div className="space-y-2">
                                <p className="flex items-center gap-2"><UsersIcon className="w-5 h-5 text-gray-500"/> <strong>Nombre:</strong> {owner.name}</p>
                                <p className="flex items-center gap-2"><MailIcon className="w-5 h-5 text-gray-500"/> <strong>Email:</strong> {owner.email}</p>
                                <p className="flex items-center gap-2"><PhoneIcon className="w-5 h-5 text-gray-500"/> <strong>Teléfono:</strong> {owner.phone || 'No registrado'}</p>
                            </div>
                        ) : (
                            <p>No se encontró información del propietario.</p>
                        )}
                    </div>
                    {/* Field Info */}
                    <div>
                         <h4 className="text-lg font-bold mb-3">Detalles de la Cancha</h4>
                         <div className="space-y-2">
                            <p><strong>Dirección:</strong> {field.address}, {field.city}</p>
                            <p><strong>Precio por Hora:</strong> ${field.pricePerHour.toLocaleString('es-CO')}</p>
                            <p><strong>Tamaño:</strong> {field.size}</p>
                            <p><strong>Descripción:</strong> {field.description}</p>
                         </div>
                    </div>
                     {/* Services */}
                     <div>
                        <h4 className="text-lg font-bold mb-3">Servicios</h4>
                        <div className="flex flex-wrap gap-3">
                            {field.services.map(service => (
                                <span key={service.name} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 py-1 px-3 rounded-full text-xs font-semibold">
                                    {service.icon} {service.name}
                                </span>
                            ))}
                        </div>
                     </div>
                     {/* Stats */}
                     <div>
                        <h4 className="text-lg font-bold mb-3">Estadísticas</h4>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <StarRating rating={field.rating} />
                                <span className="font-bold">{field.rating}</span>
                            </div>
                            <span>({field.reviews.length} opiniones)</span>
                        </div>
                     </div>
                </div>
                 <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">Cerrar</button>
                </div>
            </div>
        </div>
    )
}

const UserDetailModal: React.FC<{ user: User; onClose: () => void; }> = ({ user, onClose }) => {
    const levelToRating = (level: Player['level']): number => {
        switch (level) {
            case 'Casual': return 2;
            case 'Intermedio': return 3.5;
            case 'Competitivo': return 5;
            default: return 0;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl m-4 flex flex-col" style={{maxHeight: '90vh'}} onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Detalles del Usuario</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-5 overflow-y-auto space-y-6 text-sm">
                    {/* User Info */}
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                           {user.profilePicture ? <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" /> : <UsersIcon className="w-10 h-10 text-slate-500 dark:text-gray-400"/>}
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold">{user.name}</h4>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {user.isAdmin && <span className="text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 py-1 px-2 rounded-full">ADMIN</span>}
                                {user.isOwner && <span className="text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 py-1 px-2 rounded-full">PROPIETARIO</span>}
                                {user.isPremium && <span className="text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 py-1 px-2 rounded-full">PREMIUM</span>}
                            </div>
                        </div>
                    </div>
                     <div className="p-4 bg-slate-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                        <p className="flex items-center gap-2"><MailIcon className="w-5 h-5 text-gray-500"/> <strong>Email:</strong> {user.email}</p>
                        <p className="flex items-center gap-2"><PhoneIcon className="w-5 h-5 text-gray-500"/> <strong>Teléfono:</strong> {user.phone || 'No registrado'}</p>
                        {user.ownerStatus && <p><strong>Estado de Propietario:</strong> <span className="font-semibold">{user.ownerStatus}</span></p>}
                    </div>

                    {/* Stats */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 dark:bg-gray-700/50 rounded-lg flex items-center gap-3">
                           <HeartIcon className="w-6 h-6 text-red-500"/>
                           <div>
                                <p className="font-bold text-lg">{user.favoriteFields.length}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Campos Favoritos</p>
                           </div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-gray-700/50 rounded-lg flex items-center gap-3">
                           <CreditCardIcon className="w-6 h-6 text-blue-500"/>
                           <div>
                                <p className="font-bold text-lg">{user.paymentMethods?.length || 0}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Métodos de Pago</p>
                           </div>
                        </div>
                     </div>

                    {/* Player Profile */}
                    {user.playerProfile && (
                        <div className="p-4 bg-slate-50 dark:bg-gray-700/50 rounded-lg">
                            <h4 className="text-lg font-bold mb-3">Perfil de Jugador</h4>
                            <div className="space-y-3">
                                <p><strong>Posición:</strong> {user.playerProfile.position}</p>
                                <div className="flex items-center gap-2"><strong>Nivel:</strong> <StarRating rating={levelToRating(user.playerProfile.level)} /> ({user.playerProfile.level})</div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="p-2 bg-white dark:bg-gray-700 rounded">
                                        <p className="font-bold text-xl">{user.playerProfile.stats.matchesPlayed}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Partidos</p>
                                    </div>
                                    <div className="p-2 bg-white dark:bg-gray-700 rounded">
                                        <p className="font-bold text-xl">{user.playerProfile.stats.goals}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Goles</p>
                                    </div>
                                     <div className="p-2 bg-white dark:bg-gray-700 rounded">
                                        <p className="font-bold text-xl">{user.playerProfile.stats.assists}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Asistencias</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">Cerrar</button>
                </div>
            </div>
        </div>
    );
};


const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = (props) => {
    const { currentUser, onLogout, addNotification, setAllUsers } = props;
    const [activeTab, setActiveTab] = useState<AdminView>('dashboard');
    const [selectedField, setSelectedField] = useState<SoccerField | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const ownerOfSelectedField = useMemo(() => {
        if (!selectedField || !selectedField.ownerId) return undefined;
        return props.allUsers.find(u => u.id === selectedField.ownerId);
    }, [selectedField, props.allUsers]);

    const TABS: { id: AdminView; label: string; icon: React.ReactNode }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon className="w-6 h-6"/> },
        { id: 'verifications', label: 'Solicitudes', icon: <IdentificationIcon className="w-6 h-6"/> },
        { id: 'users', label: 'Usuarios', icon: <UsersIcon className="w-6 h-6"/> },
        { id: 'fields', label: 'Canchas', icon: <PitchIcon className="w-6 h-6"/> },
        { id: 'settings', label: 'Ajustes', icon: <CogIcon className="w-6 h-6"/> },
    ];
    
    const currentTab = TABS.find(t => t.id === activeTab);
    const pendingApplicationsCount = props.ownerApplications.filter(a => a.status === 'pending').length;

    const renderContent = () => {
        switch (activeTab) {
            case 'verifications':
                return <VerificationRequestsView {...props} />;
            case 'users':
                return (
                    <div className="space-y-3">
                        {props.allUsers.map(user => (
                            <button key={user.id} onClick={() => setSelectedUser(user)} className="w-full text-left bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <p className="font-bold">{user.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                <p className="text-xs font-bold uppercase">{user.isOwner ? 'Propietario' : 'Jugador'}</p>
                            </button>
                        ))}
                    </div>
                );
            case 'fields':
                 return (
                    <div className="space-y-3">
                        {props.fields.map(field => (
                            <button key={field.id} onClick={() => setSelectedField(field)} className="w-full text-left bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <p className="font-bold">{field.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{field.address}, {field.city}</p>
                            </button>
                        ))}
                    </div>
                );
            case 'settings':
                if (!currentUser) return null;
                return <AdminSettingsView currentUser={currentUser} setAllUsers={setAllUsers} addNotification={addNotification} onLogout={onLogout} />;
            case 'dashboard':
            default:
                 return (
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard title="Usuarios Totales" value={String(props.allUsers.length)} icon={<UsersIcon className="w-6 h-6" />} />
                        <StatCard title="Propietarios Activos" value={String(props.allUsers.filter(u => u.isOwner).length)} icon={<IdentificationIcon className="w-6 h-6" />} />
                        <StatCard title="Canchas Registradas" value={String(props.fields.length)} icon={<PitchIcon className="w-6 h-6" />} />
                        <StatCard title="Solicitudes Pendientes" value={String(pendingApplicationsCount)} icon={<DashboardIcon className="w-6 h-6" />} />
                    </div>
                );
        }
    };


    return (
         <div className="min-h-screen bg-slate-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b dark:border-gray-700 sticky top-0 z-40 p-4 flex justify-between items-center">
                 <div className="w-8"></div> {/* Spacer */}
                 <h1 className="text-xl font-bold text-center">{currentTab?.label}</h1>
                 <button onClick={props.onLogout} title="Cerrar Sesión" className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <LogoutIcon className="w-6 h-6" />
                 </button>
            </header>

            {/* Main Content */}
            <main className="p-4 pb-28">
                {renderContent()}
            </main>
            
            {selectedField && <FieldDetailModal field={selectedField} owner={ownerOfSelectedField} onClose={() => setSelectedField(null)} />}
            {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 z-50 flex justify-around items-center">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]' : 'text-gray-500 dark:text-gray-400'}`}>
                        {tab.icon}
                        <span className="text-xs font-bold">{tab.label}</span>
                        {tab.id === 'verifications' && pendingApplicationsCount > 0 && (
                            <span className="absolute -top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {pendingApplicationsCount}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default SuperAdminDashboard;