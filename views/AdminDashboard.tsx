

import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { SoccerField, ConfirmedBooking, Announcement, Notification, Service, User, FieldSize, OwnerApplication, OwnerStatus } from '../types';
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
import * as db from '../firebase';
import { SpinnerIcon } from '../components/icons/SpinnerIcon';

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

type OwnerView = 'dashboard' | 'fields' | 'bookings' | 'announcements';

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

const DashboardHome: React.FC<{ bookings: ConfirmedBooking[], fields: SoccerField[] }> = ({ bookings, fields }) => {
    const { todayRevenue, upcomingBookingsCount } = useMemo(() => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        let todayRevenue = 0;
        let upcomingBookingsCount = 0;

        bookings.forEach(b => {
            const bookingDate = new Date(b.date);
            if (bookingDate.toISOString().split('T')[0] === todayStr) {
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
            .filter(b => new Date(b.date).toISOString().split('T')[0] === dateStr)
            .reduce((sum, b) => sum + b.totalPrice, 0);
        return { label: date.toLocaleDateString('es-CO', { weekday: 'short' }), value: revenue };
    }), [bookings]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <StatCard title="Ingresos Hoy" value={`$${todayRevenue.toLocaleString()}`} icon={<CurrencyDollarIcon className="w-6 h-6" />} />
                <StatCard title="Próximas" value={String(upcomingBookingsCount)} icon={<ListBulletIcon className="w-6 h-6" />} />
                <StatCard title="Ocupación" value="68%" icon={<PitchIcon className="w-6 h-6" />} />
                <StatCard title="Canchas" value={String(fields.length)} icon={<PitchIcon className="w-6 h-6" />} />
            </div>
            <SimpleBarChart data={chartData} />
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
    const [isLocating, setIsLocating] = useState(false);
    const [formData, setFormData] = useState({
        complexId: complex?.complexId || `complex-${Date.now()}`,
        name: complex?.name || '',
        address: complex?.address || '',
        city: complex?.city || '',
        department: complex?.department || '',
        description: complex?.description || '',
        images: complex?.images || [],
        services: complex?.services.map(s => s.name) || [],
        subFields: complex?.fields.map(f => ({
            id: f.id,
            name: f.name.includes(' - ') ? f.name.split(' - ').slice(1).join(' - ') : f.name,
            size: f.size,
            pricePerHour: f.pricePerHour,
            loyaltyEnabled: f.loyaltyEnabled,
            loyaltyGoal: f.loyaltyGoal,
            availableSlots: f.availableSlots || { mañana: [], tarde: [], noche: [] },
        })) || [],
    });
    const [formErrors, setFormErrors] = useState<{ name?: string; images?: string; subFields?: string; subFieldErrorIndex?: number | null; subFieldErrorField?: 'name' | 'price' | 'loyalty' | 'slots' | null }>({});
    const [openSubFieldIndex, setOpenSubFieldIndex] = useState<number | null>(0);
    const availableServices: Service[] = [
        { name: 'Arbitraje', icon: ' whistles' },
        { name: 'Balones', icon: '⚽' },
        { name: 'Cafetería', icon: '☕' },
        { name: 'Escuela', icon: '🎓' },
        { name: 'Grabación', icon: '🎥' },
        { name: 'Graderías', icon: '🏟️' },
        { name: 'Parqueadero', icon: '🅿️' },
        { name: 'Tienda', icon: '🏪' },
        { name: 'Vestuarios', icon: '👕' },
    ];
    const allTimes = {
        mañana: ['08:00', '09:00', '10:00', '11:00'],
        tarde: ['12:00', '13:00', '14:00', '15:00', '16:00'],
        noche: ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
    };

    const handleAutofillLocation = async () => {
        setIsLocating(true);
        addNotification({ type: 'info', title: 'Geolocalización', message: 'Obteniendo tu ubicación...' });
        
        if (!navigator.geolocation) {
            addNotification({ type: 'error', title: 'Error', message: 'La geolocalización no es compatible con tu navegador.' });
            setIsLocating(false);
            return;
        }
    
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });
            
            const { latitude, longitude } = position.coords;
    
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            if (!response.ok) {
                throw new Error('Failed to fetch address data');
            }
            const data = await response.json();
            
            const { address } = data;
            const road = address.road || '';
            const house_number = address.house_number || '';
            const city = address.city || address.town || address.village || '';
            const department = address.state || '';
    
            setFormData(prev => ({
                ...prev,
                address: `${road} ${house_number}`.trim(),
                city: city,
                department: department
            }));
    
            addNotification({ type: 'success', title: 'Ubicación Encontrada', message: 'Campos de dirección actualizados.' });
    
        } catch (err) {
            console.error("Error getting location:", err as any);
            addNotification({ type: 'error', title: 'Error de Ubicación', message: 'No se pudo obtener la ubicación. Ingresa los datos manualmente.' });
        } finally {
            setIsLocating(false);
        }
    };
    

    const handleSubFieldChange = (index: number, field: string, value: any) => {
        const newSubFields = [...formData.subFields];
        (newSubFields[index] as any)[field] = value;
        setFormData({ ...formData, subFields: newSubFields });
    };

    const handleAddTimeToggle = (subFieldIndex: number, periodo: 'mañana' | 'tarde' | 'noche', time: string) => {
        const subField = formData.subFields[subFieldIndex];
        const currentSlots = subField.availableSlots[periodo] || [];
        const newSlots = currentSlots.includes(time) ? currentSlots.filter(t => t !== time) : [...currentSlots, time];
        handleSubFieldChange(subFieldIndex, 'availableSlots', { ...subField.availableSlots, [periodo]: newSlots });
    };
    
    const handleAddSubField = () => {
        const newSubField = {
            id: `new-${Date.now()}`, name: `Campo #${formData.subFields.length + 1}`, size: '5v5' as FieldSize, pricePerHour: 0,
            loyaltyEnabled: true, loyaltyGoal: 7, availableSlots: { mañana: [], tarde: [], noche: [] }
        };
        setFormData({ ...formData, subFields: [...formData.subFields, newSubField] });
        setOpenSubFieldIndex(formData.subFields.length);
    };

    const handleRemoveSubField = (index: number) => {
        const newSubFields = formData.subFields.filter((_, i) => i !== index);
        setFormData({ ...formData, subFields: newSubFields });
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1024;
                    const MAX_HEIGHT = 768;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        // Using JPEG for better compression, quality 0.8
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                        setFormData(prev => ({...prev, images: [...prev.images, dataUrl]}));
                        setFormErrors(prev => ({ ...prev, images: undefined }));
                    }
                };
                if (typeof e.target?.result === 'string') {
                    img.src = e.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({...prev, images: prev.images.filter((_, i) => i !== index)}));
    };

    const handleSaveSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setFormErrors({});

        if (!formData.name.trim()) {
            setFormErrors({ name: 'El nombre del complejo es obligatorio.' });
            return;
        }

        const hasImages = formData.images.length > 0;
        const hasSubFields = formData.subFields.length > 0;
        if (!hasImages || !hasSubFields) {
            setFormErrors({
                ...(!hasImages && { images: 'Debe cargar al menos una imagen.' }),
                ...(!hasSubFields && { subFields: 'Debe haber al menos un campo individual.' })
            });
            return;
        }

        for (let i = 0; i < formData.subFields.length; i++) {
            const subField = formData.subFields[i];

            if (!subField.name.trim()) {
                setFormErrors({ subFields: 'El nombre del campo es obligatorio.', subFieldErrorIndex: i, subFieldErrorField: 'name' });
                setOpenSubFieldIndex(i);
                return;
            }

            if (!subField.pricePerHour || subField.pricePerHour <= 0) {
                setFormErrors({ subFields: 'El precio por hora es obligatorio y debe ser mayor que 0.', subFieldErrorIndex: i, subFieldErrorField: 'price' });
                setOpenSubFieldIndex(i);
                return;
            }

            if (subField.loyaltyEnabled && (!subField.loyaltyGoal || subField.loyaltyGoal <= 0)) {
                setFormErrors({ subFields: 'El número de partidos para la recompensa es obligatorio y debe ser mayor que 0.', subFieldErrorIndex: i, subFieldErrorField: 'loyalty' });
                setOpenSubFieldIndex(i);
                return;
            }
            
            const { mañana, tarde, noche } = subField.availableSlots;
            if (mañana.length === 0 && tarde.length === 0 && noche.length === 0) {
                setFormErrors({ subFields: 'Cada campo individual debe tener al menos un horario seleccionado.', subFieldErrorIndex: i, subFieldErrorField: 'slots' });
                setOpenSubFieldIndex(i);
                return;
            }
        }

        setFormErrors({});
        const mappedServices = formData.services.map(name => availableServices.find(s => s.name === name)!).filter(Boolean);
        
        setIsSaving(true);
        try {
            await onSave({ ...formData, services: mappedServices });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl m-4 flex flex-col" style={{maxHeight: '90vh'}} onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold">{complex ? 'Editar' : 'Crear'} Complejo</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSaveSubmit} noValidate className="flex-grow overflow-hidden flex flex-col">
                    <div className="p-5 overflow-y-auto space-y-4 text-sm">
                        
                        <button type="button" onClick={handleAutofillLocation} disabled={isLocating} className="w-full flex items-center justify-center gap-2 p-2 mb-4 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-500)] disabled:opacity-50 disabled:cursor-wait">
                            {isLocating ? <SpinnerIcon className="w-5 h-5"/> : <LocationIcon className="w-5 h-5"/>}
                            {isLocating ? 'Buscando...' : 'Usar mi ubicación actual'}
                        </button>
                        
                        {/* Shared Fields */}
                        <div>
                            <label className="font-semibold block mb-1 text-xs uppercase">Nombre del Complejo <span className="text-red-500">*</span></label>
                            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${formErrors.name ? 'border-red-500' : ''}`}/>
                            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="font-semibold block mb-1 text-xs uppercase">Ciudad <span className="text-red-500">*</span></label>
                                <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                            </div>
                            <div>
                                <label className="font-semibold block mb-1 text-xs uppercase">Departamento <span className="text-red-500">*</span></label>
                                <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                            </div>
                        </div>

                        <div>
                            <label className="font-semibold block mb-1 text-xs uppercase">Dirección <span className="text-red-500">*</span></label>
                            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                        </div>

                         <div>
                            <label className="font-semibold block mb-1 text-xs uppercase">Descripción</label>
                            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" rows={2}/>
                        </div>
                        <div>
                            <label className="font-semibold block mb-2 text-xs uppercase">Imágenes <span className="text-red-500">*</span></label>
                            <div className="space-y-2">
                                {formData.images.map((img, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <img src={img} alt="preview" className="w-10 h-10 object-cover rounded" />
                                        <button onClick={() => handleRemoveImage(index)} type="button" className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className={`mt-3 w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed rounded-md ${formErrors.images ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}><PlusIcon className="w-5 h-5" /> Cargar Imagen</button>
                            {formErrors.images && <p className="text-red-500 text-xs mt-1">{formErrors.images}</p>}
                        </div>
                        <div>
                            <label className="font-semibold block mb-2 text-xs uppercase">Servicios</label>
                            <div className="flex flex-wrap gap-2">
                                {availableServices.map(service => (
                                    <button key={service.name} type="button" onClick={() => setFormData(p => ({...p, services: p.services.includes(service.name) ? p.services.filter(s => s !== service.name) : [...p.services, service.name]}))}
                                     className={`py-1 px-3 rounded-full text-xs font-semibold border ${formData.services.includes(service.name) ? 'bg-[var(--color-primary-600)] text-white border-transparent' : 'bg-gray-100 dark:bg-gray-700 dark:border-gray-600'}`}>{service.name}</button>
                                ))}
                            </div>
                        </div>

                        {/* SubFields */}
                        <div className="border-t dark:border-gray-600 pt-4 mt-4">
                            <h3 className="text-lg font-bold mb-2">Campos Individuales</h3>
                            {formErrors.subFields && <p className="text-red-500 text-sm mb-2">{formErrors.subFields}</p>}
                            <div className="space-y-2">
                                {formData.subFields.map((subField, index) => {
                                    const hasError = formErrors.subFieldErrorIndex === index;
                                    return (
                                        <div key={subField.id} className={`bg-slate-50 dark:bg-gray-700/50 rounded-lg transition-all ${hasError ? 'ring-2 ring-red-500' : ''}`}>
                                            <button type="button" onClick={() => setOpenSubFieldIndex(openSubFieldIndex === index ? null : index)} className="w-full flex justify-between items-center p-3 text-left">
                                                <span className={`font-bold ${hasError ? 'text-red-500 dark:text-red-400' : ''}`}>{subField.name || `Campo #${index + 1}`}</span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); handleRemoveSubField(index); }} className="p-1 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"><TrashIcon className="w-4 h-4"/></button>
                                                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${openSubFieldIndex === index ? 'rotate-180' : ''}`} />
                                                </div>
                                            </button>
                                            {openSubFieldIndex === index && (
                                                <div className="p-3 border-t dark:border-gray-600 space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <input type="text" placeholder="Nombre del campo" value={subField.name} onChange={e => handleSubFieldChange(index, 'name', e.target.value)} required className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${formErrors.subFieldErrorIndex === index && formErrors.subFieldErrorField === 'name' ? 'border-red-500' : ''}`}/>
                                                        <select value={subField.size} onChange={e => handleSubFieldChange(index, 'size', e.target.value)} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                                            <option value="5v5">Fútbol 5</option> <option value="7v7">Fútbol 7</option> <option value="11v11">Fútbol 11</option>
                                                        </select>
                                                    </div>
                                                    <div className="relative">
                                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">$</span>
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            placeholder="Precio por hora"
                                                            value={subField.pricePerHour > 0 ? subField.pricePerHour.toLocaleString('es-CO', { maximumFractionDigits: 2 }) : ''}
                                                            onChange={e => {
                                                                const rawValue = e.target.value;
                                                                const cleanedValue = rawValue.replace(/\./g, ''); // Remove thousand separators for es-CO
                                                                const normalizedValue = cleanedValue.replace(',', '.'); // Replace decimal comma for parsing

                                                                // Allow empty, a number, or a number with up to 2 decimal places
                                                                if (/^(\d+)?([.]\d{0,2})?$/.test(normalizedValue) || normalizedValue === '') {
                                                                    const numericValue = parseFloat(normalizedValue);
                                                                    handleSubFieldChange(index, 'pricePerHour', isNaN(numericValue) ? 0 : numericValue);
                                                                }
                                                            }}
                                                            required
                                                            className={`w-full p-2 pl-7 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${formErrors.subFieldErrorIndex === index && formErrors.subFieldErrorField === 'price' ? 'border-red-500' : ''}`}
                                                        />
                                                    </div>
                                                    
                                                    <div className="p-3 bg-slate-100 dark:bg-gray-800/50 rounded-lg space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <label className="font-semibold block text-xs uppercase">Activar fidelidad</label>
                                                            <button type="button" onClick={() => handleSubFieldChange(index, 'loyaltyEnabled', !subField.loyaltyEnabled)} className={`${subField.loyaltyEnabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors`}>
                                                                <span className={`${subField.loyaltyEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition`} />
                                                            </button>
                                                        </div>
                                                        {subField.loyaltyEnabled && <input type="number" placeholder="Partidos para recompensa" value={subField.loyaltyGoal || ''} onChange={e => handleSubFieldChange(index, 'loyaltyGoal', Number(e.target.value))} required min="1" className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${formErrors.subFieldErrorIndex === index && formErrors.subFieldErrorField === 'loyalty' ? 'border-red-500' : ''}`}/>}
                                                    </div>

                                                    <div className={`${formErrors.subFieldErrorIndex === index && formErrors.subFieldErrorField === 'slots' ? 'p-2 rounded-lg ring-1 ring-red-500' : ''}`}>
                                                        <label className="font-semibold block mb-2 text-xs uppercase">Horarios</label>
                                                        {Object.entries(allTimes).map(([periodo, times]) => (
                                                            <div key={periodo} className="mb-2">
                                                                <h4 className="font-semibold capitalize text-xs mb-1">{periodo}</h4>
                                                                <div className="grid grid-cols-4 gap-2">
                                                                    {times.map(time => (
                                                                        <button type="button" key={time} onClick={() => handleAddTimeToggle(index, periodo as any, time)} className={`py-1 px-2 rounded text-[10px] font-semibold ${subField.availableSlots[periodo as any]?.includes(time) ? 'bg-[var(--color-primary-600)] text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>{time}</button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                             <button type="button" onClick={handleAddSubField} className="mt-2 w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-500)]"><PlusIcon className="w-5 h-5" /> Añadir Campo Individual</button>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end gap-3 flex-shrink-0">
                        <button type="button" onClick={onClose} disabled={isSaving} className="py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm disabled:opacity-50">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="py-2 px-4 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm text-sm w-36 flex justify-center items-center disabled:bg-gray-400">
                            {isSaving ? <SpinnerIcon className="w-5 h-5"/> : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
        </div>
    );
};

const MyFieldsView: React.FC<{ fields: SoccerField[]; openEditor: (field: SoccerField) => void; onDelete: (field: SoccerField) => void; }> = ({ fields, openEditor, onDelete }) => (
    <div className="space-y-4">
         {fields.map(field => (
            <div key={field.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border dark:border-gray-700 flex items-center gap-3">
                <img src={field.images[0]} alt={field.name} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-grow">
                    <p className="font-bold text-gray-800 dark:text-gray-100">{field.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1"><LocationIcon className="w-3 h-3"/>{field.address}</p>
                    <p className="text-sm font-semibold text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] mt-1">${field.pricePerHour.toLocaleString()}/hr</p>
                </div>
                <div className="flex flex-col gap-2">
                    <button onClick={() => openEditor(field)} className="p-2 text-gray-400 hover:text-[var(--color-primary-500)] rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><PencilIcon className="w-5 h-5"/></button>
                    <button onClick={() => onDelete(field)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><TrashIcon className="w-5 h-5"/></button>
                </div>
            </div>
        ))}
    </div>
);

const OwnerBookingsView: React.FC<{ bookings: ConfirmedBooking[] }> = ({ bookings }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredBookings = bookings.filter(b => b.userName.toLowerCase().includes(searchTerm.toLowerCase()));

   return (
       <div className="space-y-4">
            <input type="text" placeholder="Buscar por nombre de usuario..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-3 border rounded-full dark:bg-gray-700 dark:border-gray-600 shadow-sm"/>
            {filteredBookings.map(b => (
                <div key={b.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-gray-800 dark:text-gray-100">{b.userName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{b.field.name}</p>
                        </div>
                        <p className="font-bold text-lg text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">${b.totalPrice.toLocaleString()}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(b.date).toLocaleDateString('es-CO', {weekday: 'long', day: 'numeric', month: 'short'})} a las {b.time}
                    </div>
                    {b.userPhone && (
                        <div className="mt-2 pt-2 border-t dark:border-gray-700 flex justify-between items-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <PhoneIcon className="w-4 h-4" />
                                <span>{b.userPhone}</span>
                            </p>
                            <a href={`https://wa.me/${b.userPhone.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 font-semibold py-1 px-3 rounded-full hover:bg-green-200 dark:hover:bg-green-900/80 transition-colors text-xs flex items-center gap-1">
                                <WhatsappIcon className="w-4 h-4"/>
                                Contactar
                            </a>
                        </div>
                    )}
                </div>
            ))}
       </div>
   );
};

const AnnouncementEditorModal: React.FC<{ onClose: () => void; onSave: (data: {title: string, message: string, type: 'news' | 'offer'}) => Promise<void> }> = ({ onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'news' | 'offer'>('news');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveClick = async () => {
        if(!title.trim() || !message.trim()) return;
        setIsSaving(true);
        try {
            await onSave({ title, message, type });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Crear Anuncio</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-5 space-y-4">
                    <input type="text" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                    <textarea placeholder="Mensaje" value={message} onChange={e => setMessage(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" rows={3}/>
                    <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                        <option value="news">Noticia</option>
                        <option value="offer">Oferta</option>
                    </select>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} disabled={isSaving} className="py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm disabled:opacity-50">Cancelar</button>
                    <button onClick={handleSaveClick} disabled={isSaving} className="py-2 px-4 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm text-sm w-28 flex justify-center items-center disabled:bg-gray-400">
                        {isSaving ? <SpinnerIcon className="w-5 h-5"/> : 'Publicar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AnnouncementsView: React.FC<{ announcements: Announcement[], onDelete: (id: string) => Promise<void> }> = ({ announcements, onDelete }) => {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        await onDelete(id);
        setDeletingId(null);
    };
    
    return (
        <div className="space-y-4">
            {announcements.map(item => (
                <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <p className={`text-xs font-bold uppercase ${item.type === 'offer' ? 'text-yellow-500' : 'text-blue-500'}`}>{item.type}</p>
                        <p className="font-bold text-gray-800 dark:text-gray-100">{item.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.message}</p>
                    </div>
                     <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 w-9 h-9 flex items-center justify-center">
                        {deletingId === item.id ? <SpinnerIcon className="w-5 h-5"/> : <TrashIcon className="w-5 h-5"/>}
                    </button>
                </div>
            ))}
        </div>
    );
};

const BookingCreatorModal: React.FC<{
    fields: SoccerField[];
    allUsers: User[];
    onClose: () => void;
    onSave: (bookings: Omit<ConfirmedBooking, 'id'>[]) => Promise<void>;
}> = ({ fields, allUsers, onClose, onSave }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [bookingType, setBookingType] = useState<'single' | 'recurring'>('single');
    const [fieldId, setFieldId] = useState<string>(fields[0]?.id || '');
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [time, setTime] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Recurring state
    const [recurringDays, setRecurringDays] = useState<string[]>([]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const today = new Date();
    const [endDate, setEndDate] = useState(new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0]);

    // Searchable dropdown state
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const userSearchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userSearchRef.current && !userSearchRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredUsers = useMemo(() => {
        if (!userSearchTerm) return [];
        return allUsers.filter(u =>
            u.name.toLowerCase().includes(userSearchTerm.toLowerCase())
        );
    }, [userSearchTerm, allUsers]);


    useEffect(() => {
        setUserId('');
        setUserName('');
        setUserPhone('');
        setUserSearchTerm('');
    }, [bookingType]);

    const handleUserSelect = (selectedUserId: string) => {
        const selectedUser = allUsers.find(u => u.id === selectedUserId);
        if (selectedUser) {
            setUserId(selectedUser.id);
            setUserName(selectedUser.name);
            setUserPhone(selectedUser.phone || '');
            setUserSearchTerm(selectedUser.name); // Update search input text
            setIsUserDropdownOpen(false); // Close dropdown
        }
    };

    const selectedField = useMemo(() => fields.find(f => f.id === fieldId), [fieldId, fields]);
    
    const availableTimes = useMemo(() => {
        const defaultTimes = {
            mañana: ['08:00', '09:00', '10:00', '11:00'],
            tarde: ['12:00', '13:00', '14:00', '15:00', '16:00'],
            noche: ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
        };
        const slots = selectedField?.availableSlots;
        if (slots && (slots.mañana.length > 0 || slots.tarde.length > 0 || slots.noche.length > 0)) {
            return [...slots.mañana, ...slots.tarde, ...slots.noche].sort();
        }
        return [...defaultTimes.mañana, ...defaultTimes.tarde, ...defaultTimes.noche];
    }, [selectedField]);
    
    const weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    const handleToggleDay = (day: string) => {
        setRecurringDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((bookingType === 'recurring' && !userId) || !userName || !fieldId || !time || !userPhone) {
             alert('Por favor, completa todos los campos requeridos.');
             return;
        }

        const baseBookingInfo: Omit<ConfirmedBooking, 'id' | 'date'> = {
            field: selectedField!,
            time,
            extras: { balls: 0, vests: 0 },
            totalPrice: selectedField!.pricePerHour,
            paymentMethod: 'cash',
            status: 'confirmed' as const,
            userId: userId || 'admin-created',
            userName: userName,
            userPhone: userPhone
        };

        let newBookings: Omit<ConfirmedBooking, 'id'>[] = [];

        if (bookingType === 'single') {
            newBookings.push({
                ...baseBookingInfo,
                date: new Date(`${date}T00:00:00`),
            });
        } else {
            if (recurringDays.length === 0) return;
            const start = new Date(`${startDate}T00:00:00`);
            const end = new Date(`${endDate}T00:00:00`);
            let currentDate = start;
            
            while(currentDate <= end) {
                const dayName = weekDays[currentDate.getDay()];
                if (recurringDays.includes(dayName)) {
                    newBookings.push({
                        ...baseBookingInfo,
                        date: new Date(currentDate)
                    });
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        
        setIsSaving(true);
        try {
            await onSave(newBookings);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Crear Reserva</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="font-semibold">
                                    {bookingType === 'recurring' ? 'Usuario Registrado' : 'Nombre de Usuario'} <span className="text-red-500">*</span>
                                </label>
                                {bookingType === 'recurring' ? (
                                    <div className="relative mt-1" ref={userSearchRef}>
                                        <input
                                            type="text"
                                            value={userSearchTerm}
                                            onChange={e => {
                                                setUserSearchTerm(e.target.value);
                                                setIsUserDropdownOpen(true);
                                                // Clear selection if user types
                                                setUserId('');
                                                setUserName('');
                                                setUserPhone('');
                                            }}
                                            onFocus={() => setIsUserDropdownOpen(true)}
                                            placeholder="Buscar usuario..."
                                            required={!userId}
                                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        {isUserDropdownOpen && userSearchTerm && (
                                            <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                                {filteredUsers.length > 0 ? (
                                                    filteredUsers.map(user => (
                                                        <li key={user.id}>
                                                            <button
                                                                type="button"
                                                                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                                                                onClick={() => handleUserSelect(user.id)}
                                                            >
                                                                {user.name}
                                                            </button>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="px-3 py-2 text-gray-500">No se encontraron usuarios.</li>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <input type="text" value={userName} onChange={e => setUserName(e.target.value)} required className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                                )}
                            </div>
                             <div>
                                <label className="font-semibold">Teléfono de Contacto <span className="text-red-500">*</span></label>
                                <input type="tel" value={userPhone} onChange={e => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d*$/.test(value)) {
                                        setUserPhone(value);
                                    }
                                }} readOnly={bookingType === 'recurring' && !!userId} required className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 read-only:bg-gray-100 dark:read-only:bg-gray-700/50"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="font-semibold">Cancha <span className="text-red-500">*</span></label>
                                <select value={fieldId} onChange={e => {setFieldId(e.target.value); setTime('');}} required className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                    <option value="" disabled>Seleccionar...</option>
                                    {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="font-semibold">Hora <span className="text-red-500">*</span></label>
                                <select value={time} onChange={e => setTime(e.target.value)} required disabled={!fieldId} className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-700/50">
                                    <option value="" disabled>Seleccionar...</option>
                                    {availableTimes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex space-x-2 rounded-lg bg-gray-200 dark:bg-gray-900/50 p-1">
                            <button type="button" onClick={() => setBookingType('single')} className={`w-full rounded-md py-1.5 text-sm font-semibold ${bookingType === 'single' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}>Reserva Única</button>
                            <button type="button" onClick={() => setBookingType('recurring')} className={`w-full rounded-md py-1.5 text-sm font-semibold ${bookingType === 'recurring' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}>Reserva Recurrente</button>
                        </div>
                        
                        {bookingType === 'single' && (
                            <div>
                                <label className="font-semibold">Fecha <span className="text-red-500">*</span></label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                            </div>
                        )}
                        {bookingType === 'recurring' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="font-semibold block mb-2">Repetir los días <span className="text-red-500">*</span></label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {weekDays.map(day => (
                                            <button type="button" key={day} onClick={() => handleToggleDay(day)} className={`py-2 px-2 rounded-md text-xs font-semibold transition ${recurringDays.includes(day) ? 'bg-[var(--color-primary-600)] text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>{day}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-semibold">Desde</label>
                                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                                    </div>
                                    <div>
                                        <label className="font-semibold">Hasta</label>
                                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                     <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={isSaving} className="py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm disabled:opacity-50">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="py-2 px-4 rounded-lg font-semibold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-sm text-sm w-44 flex justify-center items-center disabled:bg-gray-400">
                           {isSaving ? <SpinnerIcon className="w-5 h-5"/> : 'Guardar Reserva(s)'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Dashboard Component ---

const OwnerDashboard: React.FC<OwnerDashboardProps> = (props) => {
    const [activeTab, setActiveTab] = useState<OwnerView>('dashboard');
    const [isComplexEditorOpen, setIsComplexEditorOpen] = useState(false);
    const [editingComplex, setEditingComplex] = useState<any | null>(null);
    const [isAnnouncementEditorOpen, setIsAnnouncementEditorOpen] = useState(false);
    const [fieldToDelete, setFieldToDelete] = useState<SoccerField | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isDeletingField, setIsDeletingField] = useState(false);
    
    const handleSaveComplex = async (data: any) => {
        try {
            const complexId = data.complexId;
            const originalFieldsInComplex = props.fields.filter(f => f.complexId === complexId);
            const savedSubFieldIds = new Set(data.subFields.map((sf: any) => sf.id).filter((id: string) => !id.startsWith('new-')));
    
            const fieldsToDelete = originalFieldsInComplex.filter(f => !savedSubFieldIds.has(f.id));
            const deletePromises = fieldsToDelete.map(f => db.deleteField(f.id));
    
            const updateAndAddPromises = data.subFields.map((subField: any) => {
                const sharedProps = {
                    complexId,
                    ownerId: props.user.id,
                    address: data.address,
                    city: data.city,
                    department: data.department,
                    description: data.description,
                    images: data.images,
                    services: data.services,
                };
                const originalField = props.allFields.find(f => f.id === subField.id);
                const fieldData = {
                    ...sharedProps,
                    name: `${data.name} - ${subField.name}`,
                    size: subField.size,
                    pricePerHour: subField.pricePerHour,
                    loyaltyEnabled: subField.loyaltyEnabled,
                    loyaltyGoal: subField.loyaltyGoal,
                    availableSlots: subField.availableSlots,
                    rating: originalField?.rating || 0,
                    reviews: originalField?.reviews || [],
                    latitude: originalField?.latitude || 4.6097, // Placeholder
                    longitude: originalField?.longitude || -74.0817, // Placeholder
                };
    
                if (subField.id.startsWith('new-')) {
                    return db.addField(fieldData as Omit<SoccerField, 'id'>);
                } else {
                    return db.updateField(subField.id, fieldData).then(() => ({ ...originalField, ...fieldData, id: subField.id } as SoccerField));
                }
            });
    
            await Promise.all(deletePromises);
            const newAndUpdatedFields = await Promise.all(updateAndAddPromises);
    
            props.setFields(prev => {
                const fieldsToDeleteIds = new Set(fieldsToDelete.map(f => f.id));
                const newAndUpdatedIds = new Set(newAndUpdatedFields.map(f => f.id));
                const remainingFields = prev.filter(f => !fieldsToDeleteIds.has(f.id) && !newAndUpdatedIds.has(f.id));
                return [...remainingFields, ...newAndUpdatedFields];
            });
    
            props.addNotification({ type: 'success', title: 'Complejo Guardado', message: 'Los cambios se han guardado exitosamente.' });
            setIsComplexEditorOpen(false);
            setEditingComplex(null);
        } catch (error) {
            // FIX: Cast 'error' to 'any' to satisfy strict TypeScript rule for console.error.
            console.error('Error saving complex:', error as any);
            props.addNotification({ type: 'error', title: 'Error', message: 'No se pudo guardar el complejo.' });
        }
    };


    const confirmDeleteField = async () => {
        if (!fieldToDelete) return;
        setIsDeletingField(true);
        try {
            await db.deleteField(fieldToDelete.id);
            props.setFields(prev => prev.filter(f => f.id !== fieldToDelete.id));
            props.addNotification({
                type: 'success',
                title: 'Cancha Eliminada',
                message: `La cancha "${fieldToDelete.name}" ha sido eliminada.`,
            });
        } catch (error) {
            // FIX: Cast 'error' to 'any' to satisfy strict TypeScript rule for console.error.
            console.error('Error deleting field:', error as any);
            props.addNotification({ type: 'error', title: 'Error', message: 'No se pudo eliminar la cancha.' });
        } finally {
            setFieldToDelete(null);
            setIsDeletingField(false);
        }
    };
    
    const handleCreateAnnouncement = async (data: {title: string, message: string, type: 'news' | 'offer'}) => {
        const complexName = props.fields.length > 0 ? (props.fields[0].name.split(' - ')[0] || props.fields[0].name) : 'Tu complejo';
        const newAnnouncementData: Omit<Announcement, 'id'> = { 
            ...data, 
            createdAt: new Date(),
            ownerId: props.user.id,
            complexName: complexName
        };
        try {
            const newAnnouncement = await db.addAnnouncement(newAnnouncementData);
            props.setAnnouncements(prev => [newAnnouncement, ...prev]);
            props.addNotification({type: 'success', title: 'Anuncio Creado', message: 'El anuncio ahora es visible para los usuarios.'});
            setIsAnnouncementEditorOpen(false);
        } catch (error) {
            // FIX: Cast 'error' to 'any' to satisfy strict TypeScript rule for console.error.
            console.error('Error creating announcement:', error as any);
            props.addNotification({ type: 'error', title: 'Error', message: 'No se pudo crear el anuncio.' });
            setIsAnnouncementEditorOpen(false);
        }
    };

    const handleDeleteAnnouncement = async (announcementId: string) => {
        try {
            await db.deleteAnnouncement(announcementId);
            props.setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
            props.addNotification({ type: 'info', title: 'Anuncio Eliminado', message: 'El anuncio ha sido eliminado.' });
        } catch (error) {
            // FIX: Cast 'error' to 'any' to satisfy strict TypeScript rule for console.error.
            console.error('Error deleting announcement:', error as any);
            props.addNotification({ type: 'error', title: 'Error', message: 'No se pudo eliminar el anuncio.' });
        }
    };


    const handleSaveBookings = async (newBookingsData: Omit<ConfirmedBooking, 'id'>[]) => {
        try {
            const addedBookings = await Promise.all(newBookingsData.map(b => db.addBooking(b)));
            props.setBookings(prev => [...prev, ...addedBookings].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setIsBookingModalOpen(false);
            props.addNotification({ type: 'success', title: 'Reserva(s) Creada(s)', message: `Se han creado ${newBookingsData.length} nueva(s) reserva(s).` });
        } catch (error) {
            // FIX: Cast 'error' to 'any' to satisfy strict TypeScript rule for console.error.
            console.error('Error creating bookings:', error as any);
            props.addNotification({ type: 'error', title: 'Error', message: 'No se pudieron crear las reservas.' });
            setIsBookingModalOpen(false);
        }
    };

    const openComplexEditor = (field: SoccerField | null) => {
        if (!field) {
            setEditingComplex(null); // This will signal a new complex
        } else {
            const complexId = field.complexId || field.id;
            const fieldsInComplex = props.fields.filter(f => (f.complexId || f.id) === complexId);
            
            // If no fields found by complexId, it means it's a legacy field. Treat it as a complex of one.
            const targetFields = fieldsInComplex.length > 0 ? fieldsInComplex : [field];

            const baseName = targetFields[0].name.includes(' - ') ? targetFields[0].name.split(' - ')[0] : targetFields[0].name;

            setEditingComplex({
                complexId: complexId,
                name: baseName,
                address: targetFields[0].address,
                city: targetFields[0].city,
                department: targetFields[0].department,
                description: targetFields[0].description,
                images: targetFields[0].images,
                services: targetFields[0].services,
                fields: targetFields,
            });
        }
        setIsComplexEditorOpen(true);
    };

    const TABS: { id: OwnerView; label: string; icon: React.ReactNode }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon className="w-6 h-6"/> },
        { id: 'fields', label: 'Canchas', icon: <PitchIcon className="w-6 h-6"/> },
        { id: 'bookings', label: 'Reservas', icon: <ListBulletIcon className="w-6 h-6"/> },
        { id: 'announcements', label: 'Anuncios', icon: <MegaphoneIcon className="w-6 h-6"/> },
    ];
    
    const currentTab = TABS.find(t => t.id === activeTab);

    const fabAction = () => {
        if (activeTab === 'fields') openComplexEditor(null);
        if (activeTab === 'announcements') setIsAnnouncementEditorOpen(true);
        if (activeTab === 'bookings') setIsBookingModalOpen(true);
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
                {activeTab === 'dashboard' && <DashboardHome bookings={props.bookings} fields={props.fields} />}
                {activeTab === 'fields' && <MyFieldsView fields={props.fields} openEditor={openComplexEditor} onDelete={(field) => setFieldToDelete(field)} />}
                {activeTab === 'bookings' && <OwnerBookingsView bookings={props.bookings} />}
                {activeTab === 'announcements' && <AnnouncementsView announcements={props.announcements} onDelete={handleDeleteAnnouncement} />}
            </main>
            
            {['fields', 'announcements', 'bookings'].includes(activeTab) && (
                 <button onClick={fabAction} className="fixed bottom-24 right-6 bg-[var(--color-primary-600)] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 transform hover:scale-110 transition-transform">
                    <PlusIcon className="w-7 h-7" />
                </button>
            )}

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 z-50 flex justify-around items-center">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]' : 'text-gray-500 dark:text-gray-400'}`}>
                        <div className="relative">
                            {tab.icon}
                        </div>
                        <span className="text-xs font-bold">{tab.label}</span>
                    </button>
                ))}
            </nav>
            
            {isComplexEditorOpen && <ComplexEditorModal complex={editingComplex} onClose={() => setIsComplexEditorOpen(false)} onSave={handleSaveComplex} addNotification={props.addNotification} />}
            {isAnnouncementEditorOpen && <AnnouncementEditorModal onClose={() => setIsAnnouncementEditorOpen(false)} onSave={handleCreateAnnouncement} />}
            {isBookingModalOpen && <BookingCreatorModal fields={props.fields} allUsers={props.allUsers} onClose={() => setIsBookingModalOpen(false)} onSave={handleSaveBookings} />}

            {fieldToDelete && (
                <ConfirmationModal
                    isOpen={!!fieldToDelete}
                    onClose={() => setFieldToDelete(null)}
                    onConfirm={confirmDeleteField}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que quieres eliminar la cancha "${fieldToDelete.name}"? Esta acción no se puede deshacer.`}
                    confirmButtonText="Sí, eliminar"
                    isConfirming={isDeletingField}
                />
            )}
        </div>
    );
};

export default OwnerDashboard;