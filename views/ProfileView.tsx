import React, { useRef, useState, useMemo } from 'react';
import type { User, SoccerField, Team, SocialSection } from '../types';
import { View } from '../types';
import { UserIcon } from '../components/icons/UserIcon';
import { CreditCardIcon } from '../components/icons/CreditCardIcon';
import { HelpIcon } from '../components/icons/HelpIcon';
import { LogoutIcon } from '../components/icons/LogoutIcon';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import { LocationIcon } from '../components/icons/LocationIcon';
import { CameraIcon } from '../components/icons/CameraIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { PhoneIcon } from '../components/icons/PhoneIcon';
import { MailIcon } from '../components/icons/MailIcon';
import { LockIcon } from '../components/icons/LockIcon';
import ToggleSwitch from '../components/ToggleSwitch';
import { PaintBrushIcon } from '../components/icons/PaintBrushIcon';
import { IdentificationIcon } from '../components/icons/IdentificationIcon';
import PremiumBadge from '../components/PremiumBadge';
import LoyaltyStatus from '../components/LoyaltyStatus';
import FieldCard from '../components/FieldCard';
import { EyeIcon } from '../components/icons/EyeIcon';
import { EyeOffIcon } from '../components/icons/EyeOffIcon';
import { SpinnerIcon } from '../components/icons/SpinnerIcon';
import { ShieldIcon } from '../components/icons/ShieldIcon';
import ConfirmationModal from '../components/ConfirmationModal';

interface ProfileViewProps {
    user: User;
    allTeams: Team[];
    setSocialSection: (section: SocialSection) => void;
    onLogout: () => void;
    allFields: SoccerField[];
    onToggleFavorite: (complexId: string) => void;
    onSelectField: (field: SoccerField) => void;
    onUpdateProfilePicture: (imageDataUrl: string) => void;
    onRemoveProfilePicture: () => void;
    onUpdateUser: (data: { name: string; phone?: string }) => void;
    onChangePassword: (current: string, newPass: string) => void;
    onUpdateNotificationPreferences: (prefs: { newAvailability: boolean; specialDiscounts: boolean; importantNews: boolean; }) => void;
    onNavigate: (view: View, options?: { isBack?: boolean }) => void;
    setIsPremiumModalOpen: (isOpen: boolean) => void;
}

const ProfileMenuItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg">
        {icon}
        <span className="flex-grow font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
    </button>
);

const ProfilePicture: React.FC<{
    user: User;
    onUpdate: (dataUrl: string) => void;
    onRemove: () => void;
}> = ({ user, onUpdate, onRemove }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 15 * 1024 * 1024) { // 15MB limit
                alert("La imagen es demasiado grande. Por favor, elige una de menos de 15MB.");
                event.target.value = '';
                return;
            }

            const objectUrl = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 256;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    // Rellenar el fondo de blanco para manejar imágenes con transparencia (PNG)
                    // y evitar que el fondo se vuelva negro al convertir a JPEG.
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);

                    // Dibujar la imagen redimensionada en el canvas
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Comprimir la imagen a formato JPEG con una calidad del 70%
                    // para reducir significativamente el tamaño del archivo antes de subirlo.
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    onUpdate(dataUrl);
                }
                URL.revokeObjectURL(objectUrl);
            };
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                alert("No se pudo cargar el formato de imagen. Por favor, intenta con un archivo JPG o PNG.");
            };
            img.src = objectUrl;
        }
        event.target.value = '';
    };

    return (
        <div className="relative group w-24 h-24 mx-auto">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center shadow-md border-4 border-white/50 overflow-hidden">
                {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                    <UserIcon className="w-12 h-12 text-white" />
                )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleFileSelect}>
                <div className="flex flex-col items-center">
                    <button
                        title="Cambiar foto"
                        className="text-white p-2 rounded-full hover:bg-white/20"
                    >
                        <CameraIcon className="w-7 h-7" />
                    </button>
                </div>
                {user.profilePicture && (
                     <button
                        title="Eliminar foto"
                        className="text-white p-2 rounded-full hover:bg-white/20"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                    >
                        <TrashIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
            />
        </div>
    );
};

interface PersonalInfoEditorProps {
    user: User;
    onBack: () => void;
    onUpdateUser: (data: { name: string; phone?: string }) => Promise<void>;
    onChangePassword: (current: string, newPass: string) => Promise<void>;
}

const PersonalInfoEditor: React.FC<PersonalInfoEditorProps> = ({ user, onBack, onUpdateUser, onChangePassword }) => {
    const [isSavingInfo, setIsSavingInfo] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone || '');
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [errors, setErrors] = useState<{ new?: string; confirm?: string }>({});
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
    const isUserInfoChanged = name !== user.name || phone !== (user.phone || '');

    const handleInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingInfo(true);
        try {
            await onUpdateUser({ name, phone });
        } finally {
            setIsSavingInfo(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { new?: string; confirm?: string } = {};

        if (passwordData.new.length < 8) {
            newErrors.new = 'La contraseña debe tener al menos 8 caracteres.';
        }
        if (passwordData.new !== passwordData.confirm) {
            newErrors.confirm = 'Las nuevas contraseñas no coinciden.';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setIsSavingPassword(true);
            try {
                await onChangePassword(passwordData.current, passwordData.new);
                setPasswordData({ current: '', new: '', confirm: '' });
            } finally {
                setIsSavingPassword(false);
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8 space-y-8">
             <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] font-semibold hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver al Perfil
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Información Personal</h1>

            {/* Personal Info Form */}
            <form onSubmit={handleInfoSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 space-y-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Datos Personales</h2>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
                    <div className="mt-1 relative">
                        <UserIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-white dark:bg-gray-700" />
                    </div>
                </div>
                 <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                    <div className="mt-1 relative">
                        <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input id="phone" type="tel" value={phone} onChange={e => {
                                const value = e.target.value;
                                if (value === '' || /^\d*$/.test(value)) {
                                    setPhone(value);
                                }
                            }} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-white dark:bg-gray-700" />
                    </div>
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
                    <div className="mt-1 relative">
                        <MailIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input id="email" type="email" value={user.email} disabled className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button type="submit" disabled={!isUserInfoChanged || isSavingInfo} className="w-36 flex justify-center items-center bg-[var(--color-primary-600)] text-white font-bold py-2 px-5 rounded-lg hover:bg-[var(--color-primary-700)] transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {isSavingInfo ? <SpinnerIcon className="w-5 h-5"/> : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
            
            {/* Change Password Form */}
             <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 space-y-6">
                 <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Cambiar Contraseña</h2>
                 <div>
                    <label htmlFor="current-password" className="dark:text-gray-300">Contraseña Actual</label>
                    <div className="mt-1 relative">
                         <LockIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input id="current-password" type={showCurrent ? 'text' : 'password'} value={passwordData.current} onChange={e => setPasswordData(p => ({...p, current: e.target.value}))} required className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-white dark:bg-gray-700" />
                        <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-label="Toggle current password visibility">
                            {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>
                 </div>
                 <div>
                    <label htmlFor="new-password" className="dark:text-gray-300">Nueva Contraseña</label>
                    <div className="mt-1 relative">
                        <LockIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input id="new-password" type={showNew ? 'text' : 'password'} value={passwordData.new} onChange={e => setPasswordData(p => ({...p, new: e.target.value}))} required className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-white dark:bg-gray-700" />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-label="Toggle new password visibility">
                            {showNew ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>
                    {errors.new && <p className="text-red-600 text-sm mt-1">{errors.new}</p>}
                 </div>
                 <div>
                    <label htmlFor="confirm-password" className="dark:text-gray-300">Confirmar Nueva Contraseña</label>
                    <div className="mt-1 relative">
                        <LockIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input id="confirm-password" type={showConfirm ? 'text' : 'password'} value={passwordData.confirm} onChange={e => setPasswordData(p => ({...p, confirm: e.target.value}))} required className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-white dark:bg-gray-700" />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-label="Toggle confirm password visibility">
                            {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>
                    {errors.confirm && <p className="text-red-600 text-sm mt-1">{errors.confirm}</p>}
                 </div>
                 <div className="flex justify-end">
                    <button type="submit" disabled={isSavingPassword} className="w-48 flex justify-center items-center bg-[var(--color-primary-600)] text-white font-bold py-2 px-5 rounded-lg hover:bg-[var(--color-primary-700)] transition-colors shadow-sm disabled:bg-gray-400">
                        {isSavingPassword ? <SpinnerIcon className="w-5 h-5"/> : 'Actualizar Contraseña'}
                    </button>
                </div>
             </form>
        </div>
    );
};

const NotificationPreferences: React.FC<{
    user: User;
    onBack: () => void;
    onUpdate: (prefs: { newAvailability: boolean; specialDiscounts: boolean; importantNews: boolean; }) => Promise<void>;
}> = ({ user, onBack, onUpdate }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [prefs, setPrefs] = useState(user.notificationPreferences || { newAvailability: false, specialDiscounts: false, importantNews: false });

    const handleToggle = (key: 'newAvailability' | 'specialDiscounts' | 'importantNews') => {
        setPrefs(current => ({ ...current, [key]: !current[key] }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate(prefs);
        } finally {
            setIsSaving(false);
        }
    };

    const isChanged = JSON.stringify(prefs) !== JSON.stringify(user.notificationPreferences || { newAvailability: false, specialDiscounts: false, importantNews: false });

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8 space-y-8">
            <button onClick={onBack} className="flex items-center gap-2 text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] font-semibold hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                Volver al Perfil
            </button>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Preferencias de Notificaciones</h1>
                 <button onClick={handleSave} disabled={!isChanged || isSaving} className="w-24 flex justify-center items-center bg-[var(--color-primary-600)] text-white font-bold py-2 px-5 rounded-lg hover:bg-[var(--color-primary-700)] transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {isSaving ? <SpinnerIcon className="w-5 h-5"/> : 'Guardar'}
                </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400">
                Gestiona cómo te informamos sobre tus canchas favoritas. Te enviaremos notificaciones para mantenerte al día.
            </p>

            <div className="space-y-4">
                <ToggleSwitch
                    label="Nuevos horarios disponibles"
                    description="Recibe una alerta cuando una de tus canchas favoritas abra un nuevo horario."
                    enabled={prefs.newAvailability}
                    onChange={() => handleToggle('newAvailability')}
                />
                <ToggleSwitch
                    label="Descuentos y ofertas"
                    description="Entérate primero de los descuentos especiales en tus canchas favoritas."
                    enabled={prefs.specialDiscounts}
                    onChange={() => handleToggle('specialDiscounts')}
                />
                <ToggleSwitch
                    label="Noticias y Anuncios"
                    description="Recibe notificaciones sobre noticias importantes como torneos o mantenimientos."
                    enabled={prefs.importantNews}
                    onChange={() => handleToggle('importantNews')}
                />
            </div>
        </div>
    );
};


const ProfileView: React.FC<ProfileViewProps> = ({ user, allTeams, setSocialSection, onLogout, allFields, onToggleFavorite, onSelectField, onUpdateProfilePicture, onRemoveProfilePicture, onUpdateUser, onChangePassword, onUpdateNotificationPreferences, onNavigate, setIsPremiumModalOpen }) => {
    
    const [mode, setMode] = useState<'main' | 'editInfo' | 'editNotifications'>('main');
    const [isRemovePictureModalOpen, setIsRemovePictureModalOpen] = useState(false);
    
    const favoriteComplexes = user.favoriteFields.map(complexId => {
        return allFields.filter(field => (field.complexId || field.id) === complexId);
    }).filter(complexGroup => complexGroup.length > 0);

    const userTeams = useMemo(() => {
        if (!user.teamIds || !allTeams) return [];
        return allTeams.filter(team => user.teamIds.includes(team.id));
    }, [user, allTeams]);

    const handleTeamClick = () => {
        setSocialSection('my-team');
        onNavigate(View.SOCIAL);
    };

    if (mode === 'editInfo') {
        return (
            <PersonalInfoEditor
                user={user}
                onBack={() => setMode('main')}
                onUpdateUser={async (data) => {
                    await onUpdateUser(data);
                }}
                onChangePassword={onChangePassword}
            />
        );
    }

    if (mode === 'editNotifications') {
        return (
            <NotificationPreferences
                user={user}
                onBack={() => setMode('main')}
                onUpdate={async (newPrefs) => {
                    await onUpdateNotificationPreferences(newPrefs);
                    setMode('main');
                }}
            />
        );
    }

    
    return (
        <div className="pb-[5.5rem] md:pb-4">
            <div className="bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-700)] dark:from-gray-800 dark:to-black text-white rounded-b-3xl -mt-6 sm:-mt-8 py-10 px-4 text-center shadow-lg">
                 <ProfilePicture 
                    user={user}
                    onUpdate={onUpdateProfilePicture}
                    onRemove={() => setIsRemovePictureModalOpen(true)}
                 />
                <h1 className="text-3xl font-bold mt-4">{user.name}</h1>
                <p className="opacity-80 mt-1">{user.email}</p>
            </div>
            
            <div className="container mx-auto px-4 mt-8 space-y-6">
                {user.loyalty && (
                    <LoyaltyStatus loyaltyData={user.loyalty} allFields={allFields} />
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:border dark:border-gray-700">
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 pt-4 mb-1">Mis Equipos</h2>
                    {userTeams.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700 p-2">
                            {userTeams.map(team => (
                                <button 
                                    key={team.id}
                                    onClick={handleTeamClick}
                                    className="w-full text-left flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {team.logo ? (
                                                <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <ShieldIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-gray-100">{team.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{team.level}</p>
                                        </div>
                                    </div>
                                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 px-4">
                            <ShieldIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                            <p className="mt-2 text-gray-600 dark:text-gray-400 font-medium">No eres parte de ningún equipo.</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">Ve a DaviPlay para unirte o crear uno.</p>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:border dark:border-gray-700">
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 pt-4 mb-1">Mis Complejos Favoritos</h2>
                     {favoriteComplexes.length > 0 ? (
                        <div className="flex overflow-x-auto space-x-4 p-4 scrollbar-hide">
                            {favoriteComplexes.map(complexGroup => {
                                const complexId = complexGroup[0].complexId || complexGroup[0].id;
                                return (
                                    <div key={complexId} className="w-72 flex-shrink-0">
                                        <FieldCard 
                                            fields={complexGroup}
                                            onSelect={() => onSelectField(complexGroup[0])}
                                            isFavorite={true}
                                            onToggleFavorite={onToggleFavorite}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 px-4">
                            <HeartIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                            <p className="mt-2 text-gray-600 dark:text-gray-400 font-medium">Aún no tienes complejos favoritos.</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">¡Usa el ícono de corazón para guardar los que más te gusten!</p>
                        </div>
                    )}
                </div>

                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:border dark:border-gray-700 p-2">
                     <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 mb-1 mt-2">Cuenta</h2>
                     <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        <ProfileMenuItem icon={<IdentificationIcon className="h-6 w-6 mr-4 text-gray-500 dark:text-gray-400"/>} label="Información Personal" onClick={() => setMode('editInfo')}/>
                        <ProfileMenuItem icon={<img src="https://i.pinimg.com/736x/d9/89/fc/d989fcb7cb07f6984613f0f0ae02b6ee.jpg" alt="Notificaciones" className="h-6 w-6 mr-4 rounded-full object-cover"/>} label="Notificaciones" onClick={() => setMode('editNotifications')}/>
                        <ProfileMenuItem icon={<PaintBrushIcon className="h-6 w-6 mr-4 text-gray-500 dark:text-gray-400"/>} label="Apariencia" onClick={() => onNavigate(View.APPEARANCE)} />
                        <ProfileMenuItem icon={<CreditCardIcon className="h-6 w-6 mr-4 text-gray-500 dark:text-gray-400"/>} label="Métodos de Pago" onClick={() => onNavigate(View.PAYMENT_METHODS)} />
                     </div>
                </div>
                
                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:border dark:border-gray-700 p-2">
                     <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 mb-1 mt-2">Soporte</h2>
                     <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        <ProfileMenuItem icon={<HelpIcon className="h-6 w-6 mr-4 text-gray-500 dark:text-gray-400"/>} label="Ayuda y Soporte" onClick={() => onNavigate(View.HELP_SUPPORT)}/>
                     </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:border dark:border-gray-700 p-2">
                     <div className="divide-y divide-gray-100 dark:divide-gray-700">
                         <button onClick={onLogout} className="w-full flex items-center p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg">
                            <LogoutIcon className="h-6 w-6 mr-4 text-red-500"/>
                            <span className="flex-grow font-medium text-red-500">Cerrar Sesión</span>
                        </button>
                     </div>
                </div>
            </div>
            {isRemovePictureModalOpen && (
                <ConfirmationModal
                    isOpen={isRemovePictureModalOpen}
                    onClose={() => setIsRemovePictureModalOpen(false)}
                    onConfirm={() => {
                        onRemoveProfilePicture();
                        setIsRemovePictureModalOpen(false);
                    }}
                    title="¿Eliminar foto de perfil?"
                    message="Tu foto de perfil será eliminada permanentemente. ¿Estás seguro?"
                    confirmButtonText="Sí, eliminar"
                />
            )}
        </div>
    );
};

export default ProfileView;