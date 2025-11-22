
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { SoccerField, ConfirmedBooking, Announcement, Notification, Service, User, FieldSize, OwnerApplication, OwnerStatus, FieldExtra, RecurringContract, Player } from '../types';
import { DashboardIcon } from '../components/icons/DashboardIcon';
import { PitchIcon } from '../components/icons/PitchIcon';
import { ListBulletIcon } from '../components/icons/ListBulletIcon';
import { MegaphoneIcon } from '../components/icons/MegaphoneIcon';
import { CurrencyDollarIcon } from '../components/icons/CurrencyDollarIcon';
import { XIcon } from '../components/icons/XIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { LocationIcon } from '../components/icons/LocationIcon';
import { LogoutIcon } from '../components/icons/LogoutIcon';
import ConfirmationModal from '../components/ConfirmationModal';
import { PhoneIcon } from '../components/icons/PhoneIcon';
import { WhatsappIcon } from '../components/icons/WhatsappIcon';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import { IdentificationIcon } from '../components/icons/IdentificationIcon';
import * as db from '../database';
import { SpinnerIcon } from '../components/icons/SpinnerIcon';
import { UserIcon } from '../components/icons/UserIcon';
import { TrophyIcon } from '../components/icons/TrophyIcon';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { SunIcon } from '../components/icons/SunIcon';
import { MoonIcon } from '../components/icons/MoonIcon';
import { CheckBadgeIcon } from '../components/icons/CheckBadgeIcon';
import { SearchIcon } from '../components/icons/SearchIcon';


interface OwnerDashboardProps {
    user: User;
    fields: SoccerField[];
    setFields: React.Dispatch<React.SetStateAction<SoccerField[]>>;
    bookings: ConfirmedBooking[];
    setBookings: React.Dispatch<React.SetStateAction<ConfirmedBooking[]>>;
    announcements: Announcement[];
    setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
    onLogout: () => void;
    allUsers: User[];
    allFields: SoccerField[];
}

type OwnerView = 'dashboard' | 'fields' | 'bookings' | 'announcements' | 'contracts';

const POSSIBLE_TIMES = {
    mañana: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
    tarde: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    noche: ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
};

// Helper function to compress images
const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_DIMENSION = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height *= MAX_DIMENSION / width;
                        width = MAX_DIMENSION;
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width *= MAX_DIMENSION / height;
                        height = MAX_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    // Compress to JPEG with 60% quality to save space in Firestore
                    resolve(canvas.toDataURL('image/jpeg', 0.6));
                } else {
                    reject(new Error('Failed to get canvas context'));
                }
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

// --- Sub-Views / Components ---

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

const SimpleBarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">Ingresos (Últimos 7 días)</h3>
            <div className="flex justify-around items-end h-40 gap-2">
                {data.map(({ label, value }) => (
                    <div key={label} className="flex flex-col items-center flex-1">
                        <div
                            className="w-full bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] rounded-t-md transition-all"
                            style={{ height: `${(value / maxValue) * 100}%` }}
                            title={`$${value.toLocaleString()}`}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TopCustomers: React.FC<{ topCustomers: [string, number][] }> = ({ topCustomers }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">Top Clientes</h3>
        {topCustomers.length > 0 ? (
            <div className="space-y-3">
                {topCustomers.map(([name, count], index) => (
                    <div key={name} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                            {index + 1}
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold text-gray-700 dark:text-gray-200">{name}</p>
                        </div>
                        <div className="font-bold text-gray-800 dark:text-gray-100">{count} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">reservas</span></div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">Aún no hay suficientes datos de reservas.</p>
        )}
    </div>
);

const ScheduleManager: React.FC<{
    slots: { mañana: string[]; tarde: string[]; noche: string[] };
    onChange: (newSlots: { mañana: string[]; tarde: string[]; noche: string[] }) => void;
}> = ({ slots, onChange }) => {
    
    const toggleTime = (period: 'mañana' | 'tarde' | 'noche', time: string) => {
        const currentSlots = slots[period] || [];
        let newPeriodSlots;
        
        if (currentSlots.includes(time)) {
            newPeriodSlots = currentSlots.filter(t => t !== time);
        } else {
            newPeriodSlots = [...currentSlots, time].sort();
        }
        
        onChange({
            ...slots,
            [period]: newPeriodSlots
        });
    };

    const renderPeriod = (period: 'mañana' | 'tarde' | 'noche', icon: React.ReactNode, title: string, colorClass: string) => (
        <div className="mb-4">
            <div className={`flex items-center gap-2 mb-2 text-sm font-bold ${colorClass}`}>
                {icon}
                <span className="capitalize">{title}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {POSSIBLE_TIMES[period].map((time) => {
                    const isSelected = (slots[period] || []).includes(time);
                    return (
                        <button
                            key={time}
                            onClick={() => toggleTime(period, time)}
                            className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-all border ${
                                isSelected
                                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                                    : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-400'
                            }`}
                        >
                            {time}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">Selecciona las horas disponibles para reservar.</p>
            {renderPeriod('mañana', <SunIcon className="w-4 h-4"/>, 'Mañana', 'text-yellow-500')}
            {renderPeriod('tarde', <SunIcon className="w-4 h-4"/>, 'Tarde', 'text-orange-500')}
            {renderPeriod('noche', <MoonIcon className="w-4 h-4"/>, 'Noche', 'text-indigo-400')}
        </div>
    );
};


const DashboardHome: React.FC<{ bookings: ConfirmedBooking[], fields: SoccerField[] }> = ({ bookings, fields }) => {
    const { todayRevenue, upcomingBookingsCount } = useMemo(() => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        let todayRevenue = 0;
        let upcomingBookingsCount = 0;

        bookings.forEach(b => {
            const bookingDate = new Date(b.date);
            if (bookingDate.toISOString().split('T')[0] === todayStr && b.status === 'confirmed') {
                todayRevenue += b.totalPrice;
            }
            if (bookingDate >= today && b.status === 'confirmed') {
                upcomingBookingsCount++;
            }
        });
        return { todayRevenue, upcomingBookingsCount };
    }, [bookings]);

     const chartData = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(new Date().getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const revenue = bookings
            .filter(b => new Date(b.date).toISOString().split('T')[0] === dateStr && (b.status === 'confirmed' || b.status === 'completed'))
            .reduce((sum, b) => sum + b.totalPrice, 0);
        return { label: date.toLocaleDateString('es-CO', { weekday: 'short' }), value: revenue };
    }), [bookings]);

    const topCustomers = useMemo(() => {
        const customerCounts: { [key: string]: number } = bookings.reduce((acc, booking) => {
            if (booking.status === 'confirmed' || booking.status === 'completed') {
                acc[booking.userName] = (acc[booking.userName] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(customerCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3); // Top 3
    }, [bookings]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
                <StatCard title="Ingresos Hoy" value={`$${todayRevenue.toLocaleString()}`} icon={<CurrencyDollarIcon className="w-6 h-6" />} />
                <StatCard title="Próximas" value={String(upcomingBookingsCount)} icon={<ListBulletIcon className="w-6 h-6" />} />
                <StatCard title="Ocupación" value="68%" icon={<PitchIcon className="w-6 h-6" />} />
                <StatCard title="Canchas" value={String(fields.length)} icon={<PitchIcon className="w-6 h-6" />} />
            </div>
            <SimpleBarChart data={chartData} />
            <TopCustomers topCustomers={topCustomers} />
        </div>
    );
};

const ComplexEditorModal: React.FC<{ 
    complex: {
        complexId: string;
        name: string;
        address: string;
        city: string;
        department?: string;
        description: string;
        images: string[];
        services: Service[];
        fields: SoccerField[];
    } | null; 
    onClose: () => void; 
    onSave: (data: any) => Promise<void>;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
}> = ({ complex, onClose, onSave, addNotification }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [formData, setFormData] = useState({
        complexId: complex?.complexId || `complex-${Date.now()}`,
        name: complex?.name || '',
        address: complex?.address || '',
        city: complex?.city || '',
        department: complex?.department || '',
        description: complex?.description || '',
        images: complex?.images || [],
        services: complex?.services?.map(s => s.name) || [],
        latitude: complex?.fields?.[0]?.latitude || null,
        longitude: complex?.fields?.[0]?.longitude || null,
        extras: complex?.fields?.[0]?.extras || [], // Use first field's extras as base for complex editing
        subFields: complex?.fields?.map(f => ({
            id: f.id,
            name: f.name.includes(' - ') ? f.name.split(' - ').slice(1).join(' - ') : f.name,
            size: f.size,
            pricePerHour: f.pricePerHour,
            loyaltyEnabled: f.loyaltyEnabled,
            loyaltyGoal: f.loyaltyGoal,
            availableSlots: f.availableSlots || { mañana: [], tarde: [], noche: [] },
        })) || [],
    });
    const [formErrors, setFormErrors] = useState<{ 
        name?: string; 
        address?: string; 
        city?: string; 
        description?: string; 
        images?: string; 
        subFields?: string; 
        subFieldErrorIndex?: number | null; 
        subFieldErrorField?: 'name' | 'price' | 'loyalty' | 'slots' | null 
    }>({});
    const [openSubFieldIndex, setOpenSubFieldIndex] = useState<number | null>(0);
    const [newExtra, setNewExtra] = useState<Partial<FieldExtra>>({ name: '', price: 0, icon: '⭐', maxQuantity: 10 });

    const availableServices: Service[] = [
        { name: 'Arbitraje', icon: '🧑‍⚖️' },
        { name: 'Balones', icon: '⚽' },
        { name: 'Cafetería', icon: '☕' },
        { name: 'Escuela', icon: '🎓' },
        { name: 'Grabación', icon: '🎥' },
        { name: 'Graderías', icon: '🏟️' },
        { name: 'Parqueadero', icon: '🅿️' },
        { name: 'Tienda', icon: '🏪' },
        { name: 'Vestuarios', icon: '👕' },
    ];

    const availableExtrasPresets = [
        { name: 'Petos', price: 10000, icon: '🎽', maxQuantity: 20 },
        { name: 'Balón Extra', price: 5000, icon: '⚽', maxQuantity: 5 },
        { name: 'Arbitraje', price: 40000, icon: '🧑‍⚖️', maxQuantity: 1 },
        { name: 'Hidratación (Pack)', price: 15000, icon: '💧', maxQuantity: 5 },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when typing
        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubFieldChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const newSubFields = [...formData.subFields];
        const field = newSubFields[index];
        if (type === 'checkbox') {
            (field as any)[name] = (e.target as HTMLInputElement).checked;
        } else if (type === 'number') {
            (field as any)[name] = Number(value);
        } else {
            (field as any)[name] = value;
        }
        setFormData(prev => ({ ...prev, subFields: newSubFields }));
    };

    const handleScheduleChange = (index: number, newSlots: { mañana: string[]; tarde: string[]; noche: string[] }) => {
        const newSubFields = [...formData.subFields];
        newSubFields[index].availableSlots = newSlots;
        setFormData(prev => ({ ...prev, subFields: newSubFields }));
    };

    const addSubField = () => {
        setFormData(prev => ({
            ...prev,
            subFields: [
                ...prev.subFields,
                { 
                    id: `new-${Date.now()}`, 
                    name: '', 
                    size: '5v5', 
                    pricePerHour: 0, 
                    loyaltyEnabled: false, 
                    loyaltyGoal: 7, 
                    availableSlots: { 
                        mañana: POSSIBLE_TIMES.mañana, 
                        tarde: POSSIBLE_TIMES.tarde, 
                        noche: POSSIBLE_TIMES.noche 
                    } 
                }
            ]
        }));
        setOpenSubFieldIndex(formData.subFields.length);
    };

    const removeSubField = (index: number) => {
        setFormData(prev => ({
            ...prev,
            subFields: prev.subFields.filter((_, i) => i !== index)
        }));
    };
    
    const toggleService = (serviceName: string) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(serviceName)
                ? prev.services.filter(s => s !== serviceName)
                : [...prev.services, serviceName]
        }));
    };

    const addExtra = (extraData: Partial<FieldExtra>) => {
        const newExtraItem: FieldExtra = {
            id: `ext-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: extraData.name || 'Nuevo Servicio',
            price: Number(extraData.price) || 0,
            icon: extraData.icon || '⭐',
            maxQuantity: Number(extraData.maxQuantity) || 10
        };
        setFormData(prev => ({ ...prev, extras: [...prev.extras, newExtraItem] }));
        setNewExtra({ name: '', price: 0, icon: '⭐', maxQuantity: 10 }); // Reset form
    };

    const removeExtra = (id: string) => {
        setFormData(prev => ({ ...prev, extras: prev.extras.filter(e => e.id !== id) }));
    };

    const handleUpdateExtra = (id: string, field: keyof FieldExtra, value: any) => {
        setFormData(prev => ({
            ...prev,
            extras: prev.extras.map(e => e.id === id ? { ...e, [field]: value } : e)
        }));
    };
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files.length > 0){
            setIsUploadingImage(true);
            const file = e.target.files[0];
            try {
                const compressedImage = await compressImage(file);
                setFormData(prev => {
                    const newImages = [compressedImage, ...prev.images].slice(0, 5);
                    if (newImages.length > 0 && formErrors.images) {
                        setFormErrors(errors => ({ ...errors, images: undefined }));
                    }
                    return { ...prev, images: newImages };
                });
            } catch (error) {
                console.error("Error compressing image", error);
                addNotification({type: 'error', title: 'Error', message: 'No se pudo procesar la imagen.'});
            } finally {
                setIsUploadingImage(false);
            }
        }
    };
    
    const removeImage = (index: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const findCoordinates = async () => {
        setIsLocating(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.address + ', ' + formData.city)}&format=json&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                setFormData(prev => ({ ...prev, latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) }));
                addNotification({type: 'success', title: 'Ubicación Encontrada', message: 'Coordenadas actualizadas.'});
            } else {
                addNotification({type: 'error', title: 'Ubicación no Encontrada', message: 'No se pudo encontrar las coordenadas. Por favor, ingrésalas manualmente.'});
            }
        } catch (error) {
            addNotification({type: 'error', title: 'Error de Red', message: 'No se pudo conectar al servicio de geolocalización.'});
            console.error("Error al buscar coordenadas:", String(error));
        } finally {
            setIsLocating(false);
        }
    };

    const validateForm = () => {
        const errors: typeof formErrors = {};
        if (!formData.name.trim()) errors.name = "El nombre del complejo es obligatorio.";
        if (!formData.city.trim()) errors.city = "La ciudad es obligatoria.";
        if (!formData.address.trim()) errors.address = "La dirección es obligatoria.";
        if (!formData.description.trim()) errors.description = "La descripción es obligatoria.";
        
        if (formData.images.length === 0) {
            errors.images = "Debes subir al menos una imagen.";
        }
        
        if (formData.subFields.length === 0) {
            errors.subFields = "Debes agregar al menos una cancha.";
        } else {
            formData.subFields.forEach((field, index) => {
                if (!field.name.trim()) {
                    errors.subFieldErrorIndex = index;
                    errors.subFieldErrorField = 'name';
                    errors.subFields = "El nombre de la cancha es obligatorio.";
                } else if (!field.pricePerHour || field.pricePerHour <= 0) {
                     errors.subFieldErrorIndex = index;
                    errors.subFieldErrorField = 'price';
                    errors.subFields = "El precio debe ser mayor a cero.";
                } else if (field.loyaltyEnabled && (!field.loyaltyGoal || field.loyaltyGoal <= 0)) {
                    errors.subFieldErrorIndex = index;
                    errors.subFieldErrorField = 'loyalty';
                    errors.subFields = "El objetivo de fidelidad debe ser mayor a cero.";
                }
            });
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormSubmit = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
        onClose();
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl m-4 flex flex-col animate-slide-in-up" style={{maxHeight: '90vh'}} onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{complex ? 'Editar' : 'Crear'} Complejo</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6 text-sm">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Complejo <span className="text-red-500">*</span></label>
                            <input name="name" value={formData.name} onChange={handleInputChange} className={`w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 ${formErrors.name ? 'border-red-500' : ''}`} placeholder="Ej. Complejo El Estadio" />
                            {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                        </div>
                        <div>
                            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Ciudad <span className="text-red-500">*</span></label>
                            <input name="city" value={formData.city} onChange={handleInputChange} className={`w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 ${formErrors.city ? 'border-red-500' : ''}`} placeholder="Bogotá" />
                            {formErrors.city && <p className="text-xs text-red-500 mt-1">{formErrors.city}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input name="address" value={formData.address} onChange={handleInputChange} className={`w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 ${formErrors.address ? 'border-red-500' : ''}`} placeholder="Calle 123 #45-67" />
                                <button onClick={findCoordinates} disabled={isLocating} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400" title="Autocompletar Coordenadas"><LocationIcon className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`}/></button>
                            </div>
                            {formErrors.address && <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción <span className="text-red-500">*</span></label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} className={`w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 ${formErrors.description ? 'border-red-500' : ''}`} rows={3} />
                            {formErrors.description && <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>}
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Imágenes <span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-3">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden group">
                                    <img src={img} className="w-full h-full object-cover" alt={`preview ${idx}`}/>
                                    <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-red-500"><XIcon className="w-3 h-3"/></button>
                                </div>
                            ))}
                            {formData.images.length < 5 && (
                                <div onClick={() => !isUploadingImage && fileInputRef.current?.click()} className={`w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-[var(--color-primary-500)] ${isUploadingImage ? 'opacity-50 cursor-wait' : ''}`}>
                                    {isUploadingImage ? <SpinnerIcon className="w-6 h-6 text-[var(--color-primary-600)]"/> : <PlusIcon className="w-6 h-6 text-gray-400"/>}
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                                </div>
                            )}
                        </div>
                        {formErrors.images && <p className="text-xs text-red-500 mt-1">{formErrors.images}</p>}
                    </div>

                    {/* Services */}
                    <div>
                        <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Amenidades / Servicios Incluidos</label>
                        <div className="flex flex-wrap gap-2">
                            {availableServices.map(service => (
                                <button 
                                    key={service.name} 
                                    onClick={() => toggleService(service.name)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${formData.services.includes(service.name) ? 'bg-[var(--color-primary-100)] border-[var(--color-primary-500)] text-[var(--color-primary-800)] dark:bg-[var(--color-primary-900)]/50 dark:text-[var(--color-primary-300)]' : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}
                                >
                                    {service.icon} {service.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Extras / Billable Services */}
                    <div className="border-t dark:border-gray-700 pt-4">
                        <label className="block font-medium text-gray-700 dark:text-gray-300 mb-3">Servicios Adicionales (Extras de Pago)</label>
                        
                        {/* List of Added Extras */}
                        <div className="space-y-2 mb-4">
                            {formData.extras.map((extra) => (
                                <div key={extra.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center gap-3 flex-grow">
                                        <span className="text-2xl">{extra.icon}</span>
                                        <div className="flex-grow">
                                            <p className="font-bold text-gray-800 dark:text-gray-100">{extra.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <label className="text-xs text-gray-500 dark:text-gray-400">Precio:</label>
                                                <div className="relative w-24">
                                                    <span className="absolute left-1 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
                                                    <input 
                                                        type="number" 
                                                        value={extra.price} 
                                                        onChange={(e) => handleUpdateExtra(extra.id, 'price', Number(e.target.value))}
                                                        className="w-full pl-3 pr-1 py-0.5 text-xs border rounded dark:bg-gray-600 dark:border-gray-500 focus:ring-1 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <label className="text-xs text-gray-500 dark:text-gray-400 ml-2">Max:</label>
                                                <input 
                                                    type="number" 
                                                    value={extra.maxQuantity} 
                                                    onChange={(e) => handleUpdateExtra(extra.id, 'maxQuantity', Number(e.target.value))}
                                                    className="w-16 px-1 py-0.5 text-xs border rounded dark:bg-gray-600 dark:border-gray-500 focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => removeExtra(extra.id)} className="text-red-500 hover:bg-red-100 p-1.5 rounded-md ml-2"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            ))}
                            {formData.extras.length === 0 && <p className="text-sm text-gray-500 italic">No hay servicios adicionales configurados.</p>}
                        </div>

                        {/* Add New Extra Form */}
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
                            <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Agregar Nuevo Extra</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {availableExtrasPresets.map(preset => (
                                    <button 
                                        key={preset.name} 
                                        onClick={() => addExtra(preset)}
                                        className="text-xs bg-white dark:bg-gray-700 border dark:border-gray-600 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        + {preset.name}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-4 gap-2 items-end">
                                <div className="col-span-2">
                                    <label className="text-xs block mb-1">Nombre</label>
                                    <input 
                                        type="text" 
                                        value={newExtra.name} 
                                        onChange={e => setNewExtra({...newExtra, name: e.target.value})} 
                                        className="w-full p-1.5 text-sm border rounded dark:bg-gray-700 dark:border-gray-600" 
                                        placeholder="Ej. Arbitraje"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs block mb-1">Precio</label>
                                    <input 
                                        type="number" 
                                        value={newExtra.price} 
                                        onChange={e => setNewExtra({...newExtra, price: Number(e.target.value)})} 
                                        className="w-full p-1.5 text-sm border rounded dark:bg-gray-700 dark:border-gray-600" 
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <button 
                                        onClick={() => {
                                            if(newExtra.name && newExtra.price !== undefined) addExtra(newExtra);
                                        }}
                                        disabled={!newExtra.name || newExtra.price === undefined}
                                        className="w-full bg-blue-600 text-white p-1.5 rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sub-fields */}
                    <div className="border-t dark:border-gray-700 pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">Canchas <span className="text-red-500">*</span></h4>
                            <button onClick={addSubField} className="flex items-center gap-1 text-sm font-bold text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] hover:underline">
                                <PlusIcon className="w-4 h-4"/> Agregar Cancha
                            </button>
                        </div>
                        {formErrors.subFields && !formErrors.subFieldErrorField && <p className="text-xs text-red-500 mb-2">{formErrors.subFields}</p>}
                        
                        <div className="space-y-3">
                            {formData.subFields.map((field, idx) => (
                                <div key={field.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                                    <div 
                                        className="p-3 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        onClick={() => setOpenSubFieldIndex(openSubFieldIndex === idx ? null : idx)}
                                    >
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">{field.name || 'Nueva Cancha'} ({field.size})</span>
                                        <div className="flex items-center gap-3">
                                            <button onClick={(e) => {e.stopPropagation(); removeSubField(idx);}} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 p-1 rounded"><TrashIcon className="w-4 h-4"/></button>
                                            <ChevronDownIcon className={`w-5 h-5 transition-transform ${openSubFieldIndex === idx ? 'rotate-180' : ''}`}/>
                                        </div>
                                    </div>
                                    
                                    {openSubFieldIndex === idx && (
                                        <div className="p-4 bg-white dark:bg-gray-800 space-y-6 border-t dark:border-gray-700">
                                            {/* Info Básica de la Cancha */}
                                            <div>
                                                <h5 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Datos Básicos</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1">Nombre (ej. Cancha 1) <span className="text-red-500">*</span></label>
                                                        <input 
                                                            name="name" 
                                                            value={field.name} 
                                                            onChange={(e) => handleSubFieldChange(idx, e)} 
                                                            className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm ${formErrors.subFieldErrorIndex === idx && formErrors.subFieldErrorField === 'name' ? 'border-red-500' : ''}`} 
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1">Tamaño</label>
                                                        <select name="size" value={field.size} onChange={(e) => handleSubFieldChange(idx, e)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm">
                                                            <option value="5v5">Fútbol 5</option>
                                                            <option value="7v7">Fútbol 7</option>
                                                            <option value="11v11">Fútbol 11</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1">Precio / Hora <span className="text-red-500">*</span></label>
                                                        <input 
                                                            type="number" 
                                                            name="pricePerHour" 
                                                            value={field.pricePerHour} 
                                                            onChange={(e) => handleSubFieldChange(idx, e)} 
                                                            className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm ${formErrors.subFieldErrorIndex === idx && formErrors.subFieldErrorField === 'price' ? 'border-red-500' : ''}`} 
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-4">
                                                        <div className="flex items-center gap-2">
                                                            <input type="checkbox" name="loyaltyEnabled" checked={field.loyaltyEnabled} onChange={(e) => handleSubFieldChange(idx, e)} id={`loyalty-${idx}`} className="rounded text-[var(--color-primary-600)]" />
                                                            <label htmlFor={`loyalty-${idx}`} className="text-xs font-medium">Activar Fidelidad</label>
                                                        </div>
                                                        {field.loyaltyEnabled && (
                                                            <div className="flex items-center gap-2">
                                                                <label className="text-xs">Meta:</label>
                                                                <input type="number" name="loyaltyGoal" value={field.loyaltyGoal} onChange={(e) => handleSubFieldChange(idx, e)} className="w-16 p-1 border rounded text-sm dark:bg-gray-700" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Horarios */}
                                            <div>
                                                <h5 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Disponibilidad y Horarios</h5>
                                                <ScheduleManager 
                                                    slots={field.availableSlots || { mañana: [], tarde: [], noche: [] }}
                                                    onChange={(newSlots) => handleScheduleChange(idx, newSlots)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} disabled={isSaving} className="py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm disabled:opacity-50">Cancelar</button>
                    <button onClick={handleFormSubmit} disabled={isSaving || isUploadingImage} className="py-2 px-4 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm text-sm w-28 h-9 flex justify-center items-center disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {isSaving ? <SpinnerIcon className="w-5 h-5"/> : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const CreateContractModal: React.FC<{
    fields: SoccerField[];
    onClose: () => void;
    onSave: (data: any) => void;
    addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
}> = ({ fields, onClose, onSave, addNotification }) => {
    const [step, setStep] = useState(1);
    const [searchId, setSearchId] = useState('');
    const [foundPlayer, setFoundPlayer] = useState<User | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [contractData, setContractData] = useState({
        fieldId: fields[0]?.id || '',
        dayOfWeek: 1, // Monday
        time: '20:00',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    });

    const handleSearchPlayer = async () => {
        if (!searchId.trim()) return;
        setIsSearching(true);
        try {
            const user = await db.getUserByIdentification(searchId);
            if (user) {
                setFoundPlayer(user);
                setStep(2);
            } else {
                addNotification({ type: 'error', title: 'No encontrado', message: 'No se encontró un jugador con esa identificación.' });
            }
        } catch (error) {
            console.error(error);
            addNotification({ type: 'error', title: 'Error', message: 'Hubo un error al buscar el usuario.' });
        } finally {
            setIsSearching(false);
        }
    };

    const handleSaveContract = async () => {
        if (!foundPlayer) return;
        setIsSaving(true);
        
        // Basic validation
        const start = new Date(contractData.startDate);
        const end = new Date(contractData.endDate);
        if (start >= end) {
            addNotification({ type: 'error', title: 'Fechas inválidas', message: 'La fecha de fin debe ser posterior al inicio.' });
            setIsSaving(false);
            return;
        }

        const field = fields.find(f => f.id === contractData.fieldId);
        if (!field) return;

        try {
            await onSave({
                fieldId: contractData.fieldId,
                fieldName: field.name,
                dayOfWeek: contractData.dayOfWeek,
                time: contractData.time,
                startDate: new Date(contractData.startDate),
                endDate: new Date(contractData.endDate),
                player: foundPlayer // Pass the full player object
            });
            onClose();
        } catch (error: any) {
            addNotification({ type: 'error', title: 'Error al crear contrato', message: error.message || 'Conflicto de horarios o error de red.' });
        } finally {
            setIsSaving(false);
        }
    };

    const daysOfWeek = [
        { value: 0, label: 'Domingo' },
        { value: 1, label: 'Lunes' },
        { value: 2, label: 'Martes' },
        { value: 3, label: 'Miércoles' },
        { value: 4, label: 'Jueves' },
        { value: 5, label: 'Viernes' },
        { value: 6, label: 'Sábado' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg m-4 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Nuevo Contrato Recurrente</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="p-6 space-y-6">
                    {step === 1 && (
                        <div className="space-y-4 animate-slide-in-from-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Busca al jugador por su número de documento para iniciar el contrato.</p>
                            <div>
                                <label className="block text-sm font-medium mb-1">Identificación (Cédula)</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={searchId} 
                                        onChange={e => setSearchId(e.target.value)}
                                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="Ej. 1020304050"
                                    />
                                    <button 
                                        onClick={handleSearchPlayer} 
                                        disabled={isSearching || !searchId}
                                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 w-12 flex justify-center items-center"
                                    >
                                        {isSearching ? <SpinnerIcon className="w-5 h-5"/> : <SearchIcon className="w-5 h-5"/>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && foundPlayer && (
                        <div className="space-y-4 animate-slide-in-from-right">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    {foundPlayer.profilePicture ? <img src={foundPlayer.profilePicture} className="w-full h-full object-cover"/> : <UserIcon className="w-6 h-6 text-gray-500"/>}
                                </div>
                                <div>
                                    <p className="font-bold">{foundPlayer.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{foundPlayer.email}</p>
                                </div>
                                <button onClick={() => setStep(1)} className="ml-auto text-xs text-blue-500 hover:underline">Cambiar</button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium mb-1">Cancha</label>
                                    <select 
                                        value={contractData.fieldId}
                                        onChange={e => setContractData({...contractData, fieldId: e.target.value})}
                                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
                                    >
                                        {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">Día de la Semana</label>
                                    <select 
                                        value={contractData.dayOfWeek}
                                        onChange={e => setContractData({...contractData, dayOfWeek: Number(e.target.value)})}
                                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
                                    >
                                        {daysOfWeek.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">Hora</label>
                                    <input 
                                        type="time" 
                                        value={contractData.time}
                                        onChange={e => setContractData({...contractData, time: e.target.value})}
                                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">Fecha Inicio</label>
                                    <input 
                                        type="date" 
                                        value={contractData.startDate}
                                        onChange={e => setContractData({...contractData, startDate: e.target.value})}
                                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">Fecha Fin</label>
                                    <input 
                                        type="date" 
                                        value={contractData.endDate}
                                        onChange={e => setContractData({...contractData, endDate: e.target.value})}
                                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Cancelar</button>
                    {step === 2 && (
                        <button 
                            onClick={handleSaveContract} 
                            disabled={isSaving}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 text-sm font-semibold"
                        >
                            {isSaving && <SpinnerIcon className="w-4 h-4"/>}
                            Crear Contrato
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const ContractsManager: React.FC<{ ownerId: string, fields: SoccerField[], addNotification: any }> = ({ ownerId, fields, addNotification }) => {
    const [contracts, setContracts] = useState<RecurringContract[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contractToCancel, setContractToCancel] = useState<string | null>(null);

    useEffect(() => {
        db.getContractsByOwner(ownerId).then(setContracts);
    }, [ownerId]);

    const handleAddContract = async (data: any) => {
        const field = fields.find(f => f.id === data.fieldId);
        const player = data.player; // Get full player object passed from modal
        
        if (!field || !player) {
             addNotification({ type: 'error', title: 'Error', message: 'Faltan datos del jugador o cancha.' });
             return;
        }

        const contractPayload = {
            ownerId: ownerId,
            playerId: player.id,
            playerName: player.name,
            fieldId: field.id,
            fieldName: field.name,
            dayOfWeek: data.dayOfWeek,
            time: data.time,
            startDate: data.startDate,
            endDate: data.endDate,
        };

        try {
            // Pass the player object as the third argument required by database function
            const newContract = await db.addRecurringContract(contractPayload, field, player as User);
            setContracts(prev => [...prev, newContract]);
            addNotification({ type: 'success', title: 'Contrato Creado', message: 'Las reservas se han generado exitosamente.' });
        } catch (e: any) {
             addNotification({ type: 'error', title: 'Error', message: e.message });
        }
    };

    const handleCancelContract = async () => {
        if (!contractToCancel) return;
        try {
            await db.cancelContract(contractToCancel);
            setContracts(prev => prev.map(c => c.id === contractToCancel ? { ...c, status: 'cancelled' } : c));
            addNotification({ type: 'info', title: 'Contrato Cancelado', message: 'Las reservas futuras han sido eliminadas.' });
        } catch (error) {
            addNotification({ type: 'error', title: 'Error', message: 'No se pudo cancelar el contrato.' });
        } finally {
            setContractToCancel(null);
        }
    };

    const daysMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Contratos Recurrentes</h2>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[var(--color-primary-600)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-primary-700)] transition-colors shadow-sm">
                    <PlusIcon className="w-5 h-5" />
                    <span>Nuevo Contrato</span>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
                {contracts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Jugador</th>
                                    <th className="px-6 py-4">Cancha</th>
                                    <th className="px-6 py-4">Horario</th>
                                    <th className="px-6 py-4">Duración</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {contracts.map(contract => (
                                    <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 font-medium">{contract.playerName}</td>
                                        <td className="px-6 py-4">{contract.fieldName}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{daysMap[contract.dayOfWeek]}</span>
                                                <span className="text-gray-500">{contract.time}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${contract.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {contract.status === 'active' ? 'ACTIVO' : 'CANCELADO'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {contract.status === 'active' && (
                                                <button onClick={() => setContractToCancel(contract.id)} className="text-red-500 hover:underline text-xs font-semibold">
                                                    Cancelar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <CheckBadgeIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No hay contratos activos.</p>
                    </div>
                )}
            </div>

            {isModalOpen && <CreateContractModal fields={fields} onClose={() => setIsModalOpen(false)} onSave={handleAddContract} addNotification={addNotification} />}
            
            <ConfirmationModal 
                isOpen={!!contractToCancel}
                onClose={() => setContractToCancel(null)}
                onConfirm={handleCancelContract}
                title="¿Cancelar Contrato?"
                message="Esta acción cancelará todas las reservas futuras asociadas a este contrato. El historial de partidos jugados se mantendrá."
                confirmButtonText="Sí, cancelar contrato"
                confirmButtonColor="bg-red-600 hover:bg-red-700"
            />
        </div>
    );
};

interface ManagerProps {
    user: User;
    allFields: SoccerField[];
    fields: SoccerField[]; // User's fields
    bookings?: ConfirmedBooking[];
    announcements?: Announcement[];
    onEdit?: (item: any) => void;
    onDelete?: (id: string) => void;
    onAdd?: (item: any) => void;
    addNotification?: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
}

const FieldsManager: React.FC<ManagerProps> = ({ fields, onEdit, onDelete, onAdd }) => {
    // Group fields by complexId to show as cards
    const complexes = useMemo(() => {
        const grouped: { [key: string]: { complexId: string; name: string; address: string; city: string; department?: string; description: string; image: string; images: string[]; services: any[]; count: number, fields: SoccerField[], extras: FieldExtra[] } } = {};
        fields.forEach(f => {
            const cId = f.complexId || f.id;
            if (!grouped[cId]) {
                grouped[cId] = {
                    complexId: cId,
                    name: f.name.split(' - ')[0],
                    address: f.address,
                    city: f.city,
                    department: f.department,
                    description: f.description,
                    image: f.images[0],
                    images: f.images,
                    services: f.services,
                    count: 0,
                    fields: [],
                    extras: f.extras || []
                };
            }
            grouped[cId].count++;
            grouped[cId].fields.push(f);
        });
        return Object.values(grouped);
    }, [fields]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Mis Canchas</h2>
                <button onClick={() => onAdd?.(null)} className="flex items-center gap-2 bg-[var(--color-primary-600)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-primary-700)] transition-colors shadow-sm">
                    <PlusIcon className="w-5 h-5" />
                    <span>Nuevo Complejo</span>
                </button>
            </div>

            {complexes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {complexes.map(complex => (
                        <div key={complex.complexId} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="h-40 overflow-hidden relative">
                                <img src={complex.image} alt={complex.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                                <div className="absolute bottom-3 left-3 text-white">
                                    <h3 className="font-bold text-lg leading-tight">{complex.name}</h3>
                                    <p className="text-xs opacity-90">{complex.address}</p>
                                </div>
                            </div>
                            <div className="p-4 flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{complex.count} cancha{complex.count !== 1 ? 's' : ''}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => onEdit?.(complex)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Editar">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => onDelete?.(complex.complexId)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Eliminar">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 border-dashed border-2">
                    <PitchIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No tienes complejos registrados.</p>
                    <button onClick={() => onAdd?.(null)} className="mt-4 text-[var(--color-primary-600)] font-semibold hover:underline">Registrar mi primer complejo</button>
                </div>
            )}
        </div>
    );
};

const BookingsManager: React.FC<ManagerProps> = ({ bookings }) => {
    const sortedBookings = useMemo(() => {
        return [...(bookings || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [bookings]);

    const getStatusColor = (status: ConfirmedBooking['status']) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const translateStatus = (status: ConfirmedBooking['status']) => {
        switch (status) {
            case 'confirmed': return 'Confirmada';
            case 'completed': return 'Completada';
            case 'cancelled': return 'Cancelada';
            default: return status;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Reservas</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Hora</th>
                                <th className="px-6 py-4">Cancha</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedBookings.length > 0 ? (
                                sortedBookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 text-gray-800 dark:text-gray-200 font-medium whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-gray-400"/>
                                                {new Date(booking.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                             <div className="flex items-center gap-2">
                                                <ClockIcon className="w-4 h-4 text-gray-400"/>
                                                {booking.time}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{booking.field.name}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-800 dark:text-gray-200 font-medium">{booking.userName}</p>
                                            <p className="text-xs text-gray-500">{booking.userPhone}</p>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">${booking.totalPrice.toLocaleString('es-CO')}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                                                {translateStatus(booking.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No hay reservas registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AnnouncementsManager: React.FC<ManagerProps> = ({ user, announcements, onAdd, onDelete }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'news' | 'promo' | 'warning'>('news');

    const myAnnouncements = useMemo(() => {
        return (announcements || []).filter(a => a.ownerId === user.id).sort((a,b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    }, [announcements, user.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title.trim() || !message.trim()) return;
        
        onAdd?.({ title, message, type, ownerId: user.id });
        setTitle('');
        setMessage('');
        setType('news');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 sticky top-24">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                            <PlusIcon className="w-5 h-5"/> Crear Anuncio
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="Ej. Torneo Relámpago" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                                <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                                    <option value="news">Noticia</option>
                                    <option value="promo">Promoción</option>
                                    <option value="warning">Aviso</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensaje</label>
                                <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" rows={4} placeholder="Escribe los detalles..." required />
                            </div>
                            <button type="submit" className="w-full py-2 px-4 bg-[var(--color-primary-600)] text-white font-bold rounded-lg hover:bg-[var(--color-primary-700)] transition-colors shadow-sm">
                                Publicar
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Mis Anuncios Activos</h3>
                    {myAnnouncements.length > 0 ? (
                        myAnnouncements.map(ann => (
                            <div key={ann.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border dark:border-gray-700 relative group">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${ann.type === 'promo' ? 'bg-yellow-100 text-yellow-600' : ann.type === 'warning' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                            <MegaphoneIcon className="w-6 h-6"/>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 dark:text-gray-100">{ann.title}</h4>
                                            <span className="text-xs text-gray-500 uppercase font-semibold">{ann.type === 'promo' ? 'Promoción' : ann.type === 'warning' ? 'Aviso Importante' : 'Noticia'}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => onDelete?.(ann.id!)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Eliminar Anuncio">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                                <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{ann.message}</p>
                                <p className="mt-3 text-xs text-gray-400 text-right">{ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : 'Reciente'}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 border-dashed border-2">
                            <MegaphoneIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">No has publicado anuncios todavía.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const OwnerDashboard: React.FC<OwnerDashboardProps> = (props) => {
    const { user, onLogout, fields, bookings, announcements, addNotification, setFields, setAnnouncements, allFields } = props;
    const [view, setView] = useState<OwnerView>('dashboard');
    const [isComplexModalOpen, setIsComplexModalOpen] = useState(false);
    const [editingComplex, setEditingComplex] = useState<any>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deleteType, setDeleteType] = useState<'field' | 'announcement' | null>(null);


    const TABS: { id: OwnerView; label: string; icon: React.ReactNode }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon className="w-6 h-6"/> },
        { id: 'fields', label: 'Canchas', icon: <PitchIcon className="w-6 h-6"/> },
        { id: 'bookings', label: 'Reservas', icon: <ListBulletIcon className="w-6 h-6"/> },
        { id: 'announcements', label: 'Anuncios', icon: <MegaphoneIcon className="w-6 h-6"/> },
        { id: 'contracts', label: 'Contratos', icon: <CheckBadgeIcon className="w-6 h-6"/> },
    ];
    
    const currentTab = TABS.find(t => t.id === view);

    // -- Handlers --

    const handleSaveComplex = async (complexData: any) => {
        try {
            const { subFields, extras, ...complexInfo } = complexData;
            
            const promises = subFields.map((subField: any) => {
                // Construct the payload for the DB
                const fieldData = {
                    ...subField, // includes id, name, size, price...
                    complexId: complexInfo.complexId,
                    ownerId: user.id,
                    name: `${complexInfo.name} - ${subField.name}`, // Re-compose name
                    address: complexInfo.address,
                    city: complexInfo.city,
                    department: complexInfo.department,
                    description: complexInfo.description,
                    images: complexInfo.images,
                    services: complexInfo.services.map((s: string) => ({ name: s, icon: '✅' })), // Simplification
                    extras: extras, // Save the extras to the field
                    latitude: complexInfo.latitude || 0,
                    longitude: complexInfo.longitude || 0,
                    // Keep reviews and rating if they exist in subField, otherwise default
                    rating: subField.rating !== undefined ? subField.rating : 0, 
                    reviews: subField.reviews || [], 
                };

                // Determine Create vs Update
                if (subField.id.startsWith('new-')) {
                    // It's a new field. Remove the temp ID.
                    const { id, ...newFieldData } = fieldData;
                    return db.addField(newFieldData);
                } else {
                    // It's an existing field. Update it.
                    return db.updateField(subField.id, fieldData);
                }
            });

            await Promise.all(promises);
            
            // Refresh data
            const updatedFields = await db.getFields();
            setFields(updatedFields);
            addNotification({ type: 'success', title: 'Guardado', message: 'La información del complejo ha sido actualizada.' });

        } catch (error) {
            console.error("Error saving complex:", error);
            addNotification({ type: 'error', title: 'Error', message: 'No se pudieron guardar los cambios.' });
        }
    };

    const handleDeleteComplex = async () => {
        if (!confirmDeleteId || deleteType !== 'field') return;
        
        try {
            // Find all fields with this complexId
            const complexFields = fields.filter(f => (f.complexId || f.id) === confirmDeleteId);
            const deletePromises = complexFields.map(f => db.deleteField(f.id));
            await Promise.all(deletePromises);

            setFields(prev => prev.filter(f => (f.complexId || f.id) !== confirmDeleteId));
            addNotification({ type: 'info', title: 'Eliminado', message: 'El complejo y sus canchas han sido eliminados.' });
        } catch (error) {
             console.error("Error deleting complex:", error);
             addNotification({ type: 'error', title: 'Error', message: 'No se pudo eliminar el complejo.' });
        } finally {
            setConfirmDeleteId(null);
            setDeleteType(null);
        }
    };

    const handleCreateAnnouncement = async (data: any) => {
        try {
            const newAnn = await db.addAnnouncement({
                ...data,
                complexName: fields[0]?.name.split(' - ')[0] || 'Mi Complejo' // Fallback name
            });
            setAnnouncements(prev => [newAnn, ...prev]);
            addNotification({ type: 'success', title: 'Publicado', message: 'El anuncio está visible para los usuarios.' });
        } catch (error) {
             addNotification({ type: 'error', title: 'Error', message: 'No se pudo crear el anuncio.' });
        }
    };

    const handleDeleteAnnouncement = async () => {
        if (!confirmDeleteId || deleteType !== 'announcement') return;
        try {
            await db.deleteAnnouncement(confirmDeleteId);
            setAnnouncements(prev => prev.filter(a => a.id !== confirmDeleteId));
            addNotification({ type: 'info', title: 'Eliminado', message: 'El anuncio ha sido borrado.' });
        } catch(error) {
             addNotification({ type: 'error', title: 'Error', message: 'No se pudo eliminar el anuncio.' });
        } finally {
            setConfirmDeleteId(null);
            setDeleteType(null);
        }
    }


    const renderContent = () => {
        switch (view) {
            case 'fields': 
                return <FieldsManager 
                            user={user} 
                            allFields={allFields} 
                            fields={fields} 
                            onAdd={() => { setEditingComplex(null); setIsComplexModalOpen(true); }}
                            onEdit={(complex) => { setEditingComplex(complex); setIsComplexModalOpen(true); }}
                            onDelete={(id) => { setConfirmDeleteId(id); setDeleteType('field'); }}
                        />;
            case 'bookings': 
                return <BookingsManager user={user} allFields={allFields} fields={fields} bookings={bookings} />;
            case 'announcements': 
                return <AnnouncementsManager 
                            user={user} 
                            allFields={allFields} 
                            fields={fields} 
                            announcements={announcements}
                            onAdd={handleCreateAnnouncement}
                            onDelete={(id) => { setConfirmDeleteId(id); setDeleteType('announcement'); }}
                        />;
            case 'contracts':
                return <ContractsManager ownerId={user.id} fields={fields} addNotification={addNotification} />
            case 'dashboard':
            default:
                return <DashboardHome bookings={bookings} fields={fields} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b dark:border-gray-700 sticky top-0 z-40 p-4 flex justify-between items-center">
                 <div className="w-8"></div> {/* Spacer */}
                 <h1 className="text-xl font-bold text-center">{currentTab?.label}</h1>
                 <button onClick={onLogout} title="Cerrar Sesión" className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <LogoutIcon className="w-6 h-6" />
                 </button>
            </header>

            {/* Main Content */}
            <main className="p-4 pb-28">
                {renderContent()}
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 z-50 flex justify-around items-center">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setView(tab.id)} className={`flex flex-col items-center gap-1 transition-colors ${view === tab.id ? 'text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]' : 'text-gray-500 dark:text-gray-400'}`}>
                        {tab.icon}
                        <span className="text-xs font-bold">{tab.label}</span>
                    </button>
                ))}
            </nav>

            {/* Modals */}
            {isComplexModalOpen && (
                <ComplexEditorModal
                    complex={editingComplex}
                    onClose={() => setIsComplexModalOpen(false)}
                    onSave={handleSaveComplex}
                    addNotification={addNotification}
                />
            )}

            <ConfirmationModal 
                isOpen={!!confirmDeleteId}
                onClose={() => { setConfirmDeleteId(null); setDeleteType(null); }}
                onConfirm={deleteType === 'field' ? handleDeleteComplex : handleDeleteAnnouncement}
                title={deleteType === 'field' ? '¿Eliminar Complejo?' : '¿Eliminar Anuncio?'}
                message={deleteType === 'field' 
                    ? 'Esta acción eliminará el complejo y todas sus canchas asociadas. No se puede deshacer.' 
                    : 'El anuncio dejará de ser visible para los usuarios.'}
                confirmButtonText="Eliminar"
                confirmButtonColor="bg-red-600 hover:bg-red-700"
            />
        </div>
    );
};

export default OwnerDashboard;
